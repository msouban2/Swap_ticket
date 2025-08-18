from utils.db import db
from datetime import datetime
from bson import ObjectId

messages_collection = db["messages"]

def add_message(room_id, sender_id, role, text):
    """Insert a new message into MongoDB"""
    message = {
        "room_id": room_id,
        "sender_id": sender_id,
        "role": role,   # buyer/seller/judge
        "text": text,
        "timestamp": datetime.utcnow()
    }
    result = messages_collection.insert_one(message)
    message["_id"] = str(result.inserted_id)
    return message

def get_messages(room_id, limit=50):
    """Fetch latest messages from a room"""
    cursor = messages_collection.find(
        {"room_id": room_id}
    ).sort("timestamp", -1).limit(limit)

    messages = []
    for msg in cursor:
        msg["_id"] = str(msg["_id"])
        messages.append(msg)

    # Return newest at bottom
    return list(reversed(messages))

