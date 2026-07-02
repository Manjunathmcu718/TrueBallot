from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import random
import base64
from bson import ObjectId
import gridfs
from utils.validation import calculate_age
from utils.sms import send_sms
from services.advanced_face_verification import AdvancedFaceVerification

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/authenticate', methods=['POST'])
def authenticate_voter():
    data = request.json
    mongo = current_app.mongo
    
    voter = mongo.db.voters.find_one({
        "voter_id": data['voter_id'].upper(),
        "aadhar_number": data['aadhar_number'],
        "phone_number": data['phone_number']
    })

    if not voter:
        return jsonify({"error": "Voter not found. Please check your credentials."}), 404

    # Get age from database if available
    age = voter.get("age")

    # If age not stored, calculate from DOB
    if age is None:
        age = calculate_age(voter.get('date_of_birth'))

    # Check eligibility
    if age < 18:
        return jsonify({"error": "Voter is not eligible to vote (under 18)."}), 403

    if voter.get('has_voted'):
        voter['_id'] = str(voter['_id'])
        return jsonify({"status": "already_voted", "voter": voter}), 200

    # Perform face verification if live_image_data is provided
    if data.get('live_image_data'):
        if not voter.get('image_id'):
            return jsonify({"error": "No stored photo found for this voter. Please contact admin."}), 400
        
        try:
            fs = gridfs.GridFS(mongo.db)
            stored_image_file = fs.get(ObjectId(voter['image_id']))
            
            # Convert stored image to base64 data URL for comparison
            stored_image_bytes = stored_image_file.read()
            stored_image_base64 = base64.b64encode(stored_image_bytes).decode('utf-8')
            stored_image_data_url = f"data:image/jpeg;base64,{stored_image_base64}"
            
            # Perform face verification
            verifier = AdvancedFaceVerification()
            # Create a temporary URL-like string that the verifier can use
            # We'll modify the verifier to handle base64 data URLs directly
            face_result = verifier.comprehensive_verification(stored_image_data_url, data['live_image_data'])
            
            if not face_result.get('match', False):
                return jsonify({
                    "error": f"Face verification failed: {face_result.get('reason', 'Face mismatch')}",
                    "confidence": face_result.get('confidence', 0),
                    "detailed_scores": face_result.get('detailed_scores')
                }), 403
            
        except Exception as e:
            print(f"Face verification error: {e}")
            return jsonify({"error": f"Face verification failed: {str(e)}"}), 500

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    mongo.db.voters.update_one(
        {"_id": voter['_id']},
        {"$set": {"otp_code": otp, "otp_expires_at": expires_at}}
    )

    sms_result = send_sms(
        voter['phone_number'],
        f"Your Voter Authentication OTP is {otp}. It is valid for 5 minutes."
    )

    if not sms_result.get("success"):
        mongo.db.voters.update_one(
            {"_id": voter['_id']},
            {"$unset": {"otp_code": "", "otp_expires_at": ""}}
        )
        return jsonify({
            "error": f"OTP SMS was not sent: {sms_result.get('error', 'Unknown Twilio error')}",
            "sms": {
                "success": False,
                "simulated": bool(sms_result.get("simulated")),
                "to": sms_result.get("to")
            }
        }), 502

    return jsonify({
        "status": "otp_sent",
        "voter_id": str(voter['_id']),
        "message": f"OTP sent to mobile ending in ******{voter['phone_number'][-4:]}",
        "sms": {
            "success": True,
            "simulated": False,
            "to": sms_result.get("to"),
            "sid": sms_result.get("sid")
        }
    })
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    mongo = current_app.mongo
    
    voter = mongo.db.voters.find_one({"_id": ObjectId(data['voter_id'])})

    if not voter or 'otp_code' not in voter:
        return jsonify({"error": "Invalid request or session."}), 400

    if datetime.utcnow() > voter.get('otp_expires_at', datetime.min):
        return jsonify({"error": "OTP has expired. Please try again."}), 410

    if data['otp'] != voter['otp_code']:
        return jsonify({"error": "Invalid OTP provided."}), 400

    mongo.db.voters.update_one({"_id": voter['_id']}, {"$unset": {"otp_code": "", "otp_expires_at": ""}})

    voter['_id'] = str(voter['_id'])
    return jsonify({"status": "verified", "voter": voter})

@auth_bp.route('/vote', methods=['POST'])
def record_vote():
    mongo = current_app.mongo
    data = request.json
    voter_id_str = data.get('voterId') 

    if not voter_id_str:
        return jsonify({"error": "Voter ID is missing"}), 400

    try:
        voter_object_id = ObjectId(voter_id_str)

        voter_check = mongo.db.voters.find_one({"_id": voter_object_id})
        if voter_check and voter_check.get("has_voted"):
            voter_check['_id'] = str(voter_check['_id'])
            return jsonify(voter_check), 200

        result = mongo.db.voters.update_one(
            {"_id": voter_object_id},
            {
                "$set": {
                    "has_voted": True,
                    "voting_timestamp": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Voter not found or vote could not be recorded."}), 404

        updated_voter = mongo.db.voters.find_one({"_id": voter_object_id})
        
        if updated_voter:
            confirmation_id = f"VT{datetime.now().strftime('%Y%m%d%H%M%S')}"
            send_sms(updated_voter['phone_number'], f"Your vote has been successfully recorded. Confirmation ID: {confirmation_id}.")
        
        updated_voter['_id'] = str(updated_voter['_id'])
        
        return jsonify(updated_voter), 200

    except Exception as e:
        print(f"Error in /vote endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@auth_bp.route('/compare-faces', methods=['POST'])
def compare_faces_advanced():
    """Advanced face verification with geometry, anti-spoof, and detailed scoring"""
    data = request.json
    stored_image_url = data.get('stored_image_url')
    live_image_data = data.get('live_image_data')
    
    if not stored_image_url or not live_image_data:
        return jsonify({"error": "Missing image data"}), 400
    
    try:
        verifier = AdvancedFaceVerification()
        result = verifier.comprehensive_verification(stored_image_url, live_image_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Face verification error: {e}")
        return jsonify({
            "match": False,
            "confidence": 0,
            "reason": f"Verification failed: {str(e)}",
            "detailed_scores": None
        }), 500
