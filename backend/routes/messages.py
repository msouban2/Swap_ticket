from flask import Blueprint, request, jsonify
from models.messages import add_message, get_messages

messages_bp = Blueprint("messages", __name__)

@messages_bp.route("/messages", methods=["POST"])
def add_message_route():
    data = request.json
    chatroom_id = data.get("chatroom_id")
    sender_id = data.get("sender_id")
    text = data.get("text")
    message = add_message(chatroom_id, sender_id, text)
    return jsonify(message), 201

@messages_bp.route("/messages/<chatroom_id>", methods=["GET"])
def get_messages_route(chatroom_id):
    messages = get_messages(chatroom_id)
    return jsonify(messages), 200
