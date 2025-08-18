from flask import Blueprint, request, jsonify
from models.chatrooms import create_chatroom

chatrooms_bp = Blueprint("chatrooms", __name__)

@chatrooms_bp.route("/chatrooms", methods=["POST"])
def create_chatroom_route():
    data = request.json
    buyer_id = data.get("buyer_id")
    seller_id = data.get("seller_id")
    judge_id = data.get("judge_id")
    chatroom = create_chatroom(buyer_id, seller_id, judge_id)
    return jsonify(chatroom), 201
