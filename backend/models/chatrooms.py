from utils.db import db
from datetime import datetime

chatrooms_collection = db["chatrooms"]

def create_chatroom(buyer_id, seller_id, judge_id):
    chatroom = {
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "judge_id": judge_id,
        "created_at": datetime.utcnow()
    }
    result = chatrooms_collection.insert_one(chatroom)
    chatroom["_id"] = str(result.inserted_id)
    return chatroom
