from collections import Counter
from datetime import date, datetime

from flask import Blueprint, current_app, jsonify, render_template

analysis_bp = Blueprint("analysis_bp", __name__)


def _serialize_value(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def _serialize_voter(voter):
    return {
        key: _serialize_value(value)
        for key, value in voter.items()
        if key != "_id"
    }


def _build_analysis_payload():
    mongo = current_app.mongo
    voters = [
        _serialize_voter(voter)
        for voter in mongo.db.voters.find({}, {"_id": 0})
    ]

    aadhar_count = Counter(voter.get("aadhar_number", "") for voter in voters)
    voter_id_count = Counter(voter.get("voter_id", "") for voter in voters)

    voted = []
    not_voted = []
    anomaly = []

    for voter in voters:
        aid = voter.get("aadhar_number", "")
        vid = voter.get("voter_id", "")
        is_unique = aadhar_count.get(aid, 0) == 1 and voter_id_count.get(vid, 0) == 1
        is_verified = voter.get("is_verified", False)

        current_location = (voter.get("current_location") or "").strip().lower()
        booth_address = (
            voter.get("booth_address") or voter.get("polling_station") or ""
        ).strip().lower()
        location_matches = current_location != "" and current_location == booth_address

        if is_unique and is_verified and location_matches:
            voted.append(voter)
            continue

        if is_unique and is_verified and not location_matches:
            not_voted.append(voter)
            continue

        reason = []
        if not is_unique:
            if aadhar_count.get(aid, 0) > 1:
                reason.append("Duplicate Aadhar")
            if voter_id_count.get(vid, 0) > 1:
                reason.append("Duplicate Voter ID")
        if not is_verified:
            reason.append("Unverified")

        anomaly.append(
            {
                **voter,
                "anomaly_reason": ", ".join(reason) or "Flagged for review",
            }
        )

    return {
        "voted": voted,
        "not_voted": not_voted,
        "anomaly": anomaly,
        "counts": {
            "voted": len(voted),
            "not_voted": len(not_voted),
            "anomaly": len(anomaly),
        },
    }


@analysis_bp.route("/api/voter-analysis", methods=["GET"])
def voter_analysis():
    return jsonify(_build_analysis_payload())


@analysis_bp.route("/api/analysis/voter-categories", methods=["GET"])
def voter_categories():
    analysis_data = _build_analysis_payload()
    return jsonify(
        {
            "voted": {
                "count": analysis_data["counts"]["voted"],
                "voters": analysis_data["voted"],
            },
            "not_voted": {
                "count": analysis_data["counts"]["not_voted"],
                "voters": analysis_data["not_voted"],
            },
            "anomaly": {
                "count": analysis_data["counts"]["anomaly"],
                "voters": analysis_data["anomaly"],
            },
        }
    )


@analysis_bp.route("/voter-analysis", methods=["GET"])
def voter_analysis_page():
    return render_template("voter_analysis.html")
