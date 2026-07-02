from flask import Blueprint, jsonify, current_app
from datetime import datetime

data_bp = Blueprint('data_bp', __name__)


@data_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    mongo = current_app.mongo
    total_voters = mongo.db.voters.count_documents({})
    voted_count = mongo.db.voters.count_documents({"has_voted": True})

    recent_votes = list(mongo.db.voters.find(
        {"has_voted": True}
    ).sort("voting_timestamp", -1).limit(10))

    for vote in recent_votes:
        vote['_id'] = str(vote['_id'])
        if vote.get('voting_timestamp'):
            vote['voting_timestamp'] = vote['voting_timestamp'].isoformat()
        if vote.get('date_of_birth'):
            vote['date_of_birth'] = vote['date_of_birth'].strftime('%Y-%m-%d')

    return jsonify({
        "totalVoters": total_voters,
        "votedCount": voted_count,
        "notVotedCount": total_voters - voted_count,
        "votingPercentage": round((voted_count / total_voters * 100), 1) if total_voters > 0 else 0,
        "recentVotes": recent_votes
    })


@data_bp.route('/voters', methods=['GET'])
def get_voters():
    mongo = current_app.mongo
    voters = list(mongo.db.voters.find(
        {}, {'otp_code': 0, 'otp_expires_at': 0}
    ).limit(100))

    for v in voters:
        v['_id'] = str(v['_id'])
        if v.get('date_of_birth'):
            v['date_of_birth'] = v['date_of_birth'].strftime('%Y-%m-%d')
        if v.get('voting_timestamp'):
            v['voting_timestamp'] = v['voting_timestamp'].isoformat()

    return jsonify({"voters": voters})


@data_bp.route('/ai/detect-anomalies', methods=['POST'])
def detect_anomalies():
    mongo = current_app.mongo
    anomalies = []

    voters = list(mongo.db.voters.find({}))
    booths = list(mongo.db.booths.find({}))

    for booth in booths:
        booth_name = booth['booth_name']
        total_registered = len([v for v in voters if v.get('polling_station') == booth_name])
        voted_count = len([v for v in voters if v.get('polling_station') == booth_name and v.get('has_voted')])

        if total_registered == 0:
            continue

        turnout = (voted_count / total_registered) * 100

        if turnout > 95 and total_registered > 20:
            anomalies.append({
                "booth_name": booth_name,
                "detection_type": "High Turnout",
                "details": f"Turnout is {turnout:.1f}% ({voted_count}/{total_registered})",
                "confidence_score": 0.9,
                "detected_at": datetime.utcnow()
            })

        if turnout < 10 and total_registered > 50:
            anomalies.append({
                "booth_name": booth_name,
                "detection_type": "Low Turnout",
                "details": f"Turnout is only {turnout:.1f}% ({voted_count}/{total_registered})",
                "confidence_score": 0.8,
                "detected_at": datetime.utcnow()
            })

    for anomaly in anomalies:
        mongo.db.anomalies.update_one(
            {"booth_name": anomaly['booth_name'], "detection_type": anomaly['detection_type']},
            {"$set": anomaly},
            upsert=True
        )

    return jsonify({"status": "detection_complete", "anomalies_found": len(anomalies)})


@data_bp.route('/ai/anomalies', methods=['GET'])
def get_anomalies():
    mongo = current_app.mongo
    anomalies = list(mongo.db.anomalies.find().sort("detected_at", -1))
    for anomaly in anomalies:
        anomaly['_id'] = str(anomaly['_id'])
        if anomaly.get('detected_at'):
            anomaly['detected_at'] = anomaly['detected_at'].isoformat()
    return jsonify(anomalies)

import csv
import io
from flask import make_response

@data_bp.route('/export/voters-csv', methods=['GET'])
def export_voters_csv():
    mongo = current_app.mongo
    voters = list(mongo.db.voters.find({}, {'_id': 0, 'otp_code': 0, 'otp_expires_at': 0}))
    
    if not voters:
        return jsonify({"error": "No voter data found"}), 404
    
    # Convert datetime objects to strings
    for v in voters:
        if v.get('date_of_birth') and not isinstance(v['date_of_birth'], str):
            v['date_of_birth'] = v['date_of_birth'].strftime('%Y-%m-%d')
        if v.get('voting_timestamp') and not isinstance(v['voting_timestamp'], str):
            v['voting_timestamp'] = v['voting_timestamp'].isoformat()

    # Collect ALL possible field names from ALL records
    all_fields = set()
    for v in voters:
        all_fields.update(v.keys())
    all_fields = sorted(list(all_fields))  # consistent column order

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=all_fields, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(voters)
    
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = 'attachment; filename=voters.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response
