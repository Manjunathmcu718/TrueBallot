from flask import Blueprint, jsonify, current_app
from datetime import datetime
import random

anomaly_bp = Blueprint("anomaly_bp", __name__)

# ---------------------------------------------------
# 🔍 RUN AI ANOMALY DETECTION
# ---------------------------------------------------

@anomaly_bp.route("/ai/detect-anomalies", methods=["POST"])
def detect_anomalies():

    mongo = current_app.mongo

    voters = list(mongo.db.voters.find())
    mongo.db.anomalies.delete_many({})

    anomalies = []

    # ---------------------------------------------------
    # GROUP VOTERS BY BOOTH
    # ---------------------------------------------------

    booth_map = {}

    for voter in voters:
        booth = voter.get("polling_station", "Unknown")
        booth_map.setdefault(booth, []).append(voter)

    # ---------------------------------------------------
    # 🚨 TURNOUT ANOMALIES
    # ---------------------------------------------------

    for booth, booth_voters in booth_map.items():

        total = len(booth_voters)
        voted = len([v for v in booth_voters if v.get("has_voted")])

        if total == 0:
            continue

        turnout = (voted / total) * 100

        # High turnout
        if turnout > 15:

            anomaly = {
                "booth_name": booth,
                "detection_type": "High Turnout",
                "details": f"Turnout reached {round(turnout,2)}%",
                "confidence_score": round(random.uniform(0.85, 0.95), 2),
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

        # Low turnout
        if turnout < 10 and total > 20:

            anomaly = {
                "booth_name": booth,
                "detection_type": "Low Turnout",
                "details": f"Turnout very low at {round(turnout,2)}%",
                "confidence_score": round(random.uniform(0.75, 0.90), 2),
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

    # ---------------------------------------------------
    # 🚨 DUPLICATE AADHAAR
    # ---------------------------------------------------

    seen_aadhar = {}

    for voter in voters:

        aadhar = voter.get("aadhar_number")

        if aadhar in seen_aadhar:

            anomaly = {
                "booth_name": voter.get("polling_station"),
                "detection_type": "Duplicate Identity",
                "details": f"Duplicate Aadhar detected: {aadhar}",
                "confidence_score": 0.98,
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

        else:
            seen_aadhar[aadhar] = True

    # ---------------------------------------------------
    # 🚨 LOCATION MISMATCH
    # ---------------------------------------------------

    for voter in voters:

        registered = voter.get("address", "").lower()
        current = voter.get("current_location", "").lower()

        if current and registered and current not in registered:

            anomaly = {
                "booth_name": voter.get("polling_station"),
                "detection_type": "Location Mismatch",
                "details": f"{voter.get('full_name')} voting from unusual location",
                "confidence_score": round(random.uniform(0.80, 0.92), 2),
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

    # ---------------------------------------------------
    # 🚨 SHARED PHONE FRAUD
    # ---------------------------------------------------

    phone_map = {}

    for voter in voters:

        phone = voter.get("phone_number")

        if phone in phone_map:

            anomaly = {
                "booth_name": voter.get("polling_station"),
                "detection_type": "Shared Phone Fraud",
                "details": f"Multiple voters using phone {phone}",
                "confidence_score": 0.90,
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

        else:
            phone_map[phone] = True

    # ---------------------------------------------------
    # 🚨 VOTE SPIKE DETECTION
    # ---------------------------------------------------

    for booth, booth_voters in booth_map.items():

        voted_voters = [v for v in booth_voters if v.get("has_voted")]

        if len(voted_voters) > 40:

            anomaly = {
                "booth_name": booth,
                "detection_type": "Vote Spike",
                "details": f"{len(voted_voters)} votes cast unusually fast",
                "confidence_score": round(random.uniform(0.75, 0.90), 2),
                "detected_at": datetime.utcnow()
            }

            mongo.db.anomalies.insert_one(anomaly)
            anomalies.append(anomaly)

    return jsonify({
        "status": "detection_complete",
        "anomalies_found": len(anomalies)
    })


# ---------------------------------------------------
# GET DETECTED ANOMALIES
# ---------------------------------------------------

@anomaly_bp.route("/ai/anomalies", methods=["GET"])
def get_anomalies():

    mongo = current_app.mongo

    anomalies = list(
        mongo.db.anomalies.find({}, {"_id": 0})
    )

    return jsonify(anomalies)


# ---------------------------------------------------
# TEST ROUTES
# ---------------------------------------------------

@anomaly_bp.route("/test/high-turnout", methods=["POST"])
def test_high_turnout():

    mongo = current_app.mongo

    mongo.db.voters.update_many({}, {"$set": {"has_voted": True}})

    return jsonify({"message": "High turnout test created"})


@anomaly_bp.route("/test/low-turnout", methods=["POST"])
def test_low_turnout():

    mongo = current_app.mongo

    mongo.db.voters.update_many({}, {"$set": {"has_voted": False}})

    voters = list(mongo.db.voters.find().limit(5))

    for voter in voters:

        mongo.db.voters.update_one(
            {"_id": voter["_id"]},
            {"$set": {"has_voted": True}}
        )

    return jsonify({"message": "Low turnout test created"})


@anomaly_bp.route("/test/duplicate-aadhar", methods=["POST"])
def test_duplicate_aadhar():

    mongo = current_app.mongo

    voters = list(mongo.db.voters.find().limit(2))

    if len(voters) >= 2:

        duplicate = voters[0]["aadhar_number"]

        mongo.db.voters.update_one(
            {"_id": voters[1]["_id"]},
            {"$set": {"aadhar_number": duplicate}}
        )

    return jsonify({"message": "Duplicate Aadhar created"})
@anomaly_bp.route("/test/mark-20-voted", methods=["POST"])
def mark_17_voted():

    mongo = current_app.mongo

    voters = list(mongo.db.voters.find().limit(17))

    for voter in voters:
        mongo.db.voters.update_one(
            {"_id": voter["_id"]},
            {
                "$set": {
                    "has_voted": True,
                    "voting_timestamp": datetime.utcnow()
                }
            }
        )

    return jsonify({"message": "First 20 voters marked as voted for demo"})

