from flask import Blueprint, request, jsonify
from utils.db import db
from datetime import datetime

tickets_bp = Blueprint("tickets", __name__)
tickets_collection = db["tickets"]

@tickets_bp.route("/tickets", methods=["POST"])
def add_ticket():
    try:
        data = request.json
        ticket = {
            "user_id": data.get("user_id"),
            "category": data.get("category"),
            "sub_category": data.get("sub_category"),
            "price": data.get("price"),
            "details": data.get("details"),  # JSON object {from,to,date}
            "created_at": data.get("created_at", datetime.utcnow().isoformat())
        }
        result = tickets_collection.insert_one(ticket)
        ticket["_id"] = str(result.inserted_id)
        return jsonify(ticket), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@tickets_bp.route("/tickets", methods=["GET"])
def get_tickets():
    try:
        tickets = []
        for t in tickets_collection.find():
            t["_id"] = str(t["_id"])
            tickets.append(t)
        return jsonify(tickets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
