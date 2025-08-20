from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from pymongo import MongoClient
from PIL import Image
import pytesseract
import requests
import os
import datetime

# --- App Setup ---
app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

# --- Socket.IO Setup ---
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# --- MongoDB Setup ---
client = MongoClient("mongodb://localhost:27017")
db = client["ticket_app"]
chatrooms = db.chatrooms
messages = db.messages
tickets = db.tickets

# --- Ollama API Config ---
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"

# --- Routes ---
@app.route("/")
def home():
    return jsonify({"msg": "Server is running"})

@app.route("/health")
def health():
    return jsonify({"ok": True, "service": "chat-backend"})

@app.route("/chatrooms", methods=["POST"])
def create_chatroom():
    data = request.get_json(force=True)
    room_id = data.get("roomId")
    if not room_id:
        return jsonify({"error": "roomId required"}), 400

    chatrooms.update_one(
        {"_id": room_id},
        {"$setOnInsert": {
            "_id": room_id,
            "buyer_id": data.get("buyer_id"),
            "seller_id": data.get("seller_id"),
            "judge_id": data.get("judge_id"),
            "created_at": datetime.datetime.utcnow(),
        }},
        upsert=True,
    )
    return jsonify({"ok": True, "roomId": room_id})

@app.route("/chatrooms/<room_id>/messages", methods=["GET"])
def get_room_messages(room_id):
    docs = list(messages.find({"room_id": room_id}).sort("timestamp", 1))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat() + "Z"
    return jsonify(docs)

@app.route("/process_ticket", methods=["POST"])
def process_ticket():
    try:
        file = request.files.get("file")
        if not file or file.filename == "":
            return jsonify({"error": "No valid file uploaded"}), 400

        ext = file.filename.split(".")[-1].lower()
        temp_path = f"temp_upload.{ext}"
        file.save(temp_path)

        image = Image.open(temp_path)
        extracted_text = pytesseract.image_to_string(image)
        os.remove(temp_path)

        prompt = f"Extract ticket details from this text and return valid JSON:\n{extracted_text}"
        response = requests.post(OLLAMA_API_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        })

        if response.status_code != 200:
            return jsonify({"error": "Ollama request failed", "details": response.text}), 500

        ollama_output = response.json().get("response", "").strip()

        ticket_doc = {
            "ocr_text": extracted_text.strip(),
            "ollama_summary": ollama_output,
            "created_at": datetime.datetime.utcnow()
        }
        result = tickets.insert_one(ticket_doc)

        return jsonify({
            "ticket_id": str(result.inserted_id),
            "ocr_text": extracted_text.strip(),
            "ollama_summary": ollama_output
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Socket.IO Events ---
@socketio.on("join")
def handle_join(data):
    room = data.get("roomId")
    user_id = data.get("userId")
    role = data.get("role")
    name = data.get("name", user_id)

    if not room:
        emit("error", {"message": "roomId required"})
        return

    join_room(room)

    chatrooms.update_one(
        {"_id": room},
        {
            "$setOnInsert": {"_id": room, "created_at": datetime.datetime.utcnow()},
            "$addToSet": {"members": {"user_id": user_id, "role": role, "name": name}}
        },
        upsert=True
    )

    emit("system", {"msg": f"{name} joined", "roomId": room}, room=room)

@socketio.on("send_message")
def handle_send_message(data):
    room = data.get("roomId")
    user_id = data.get("userId")
    role = data.get("role")
    text = (data.get("text") or "").strip()

    if not room or not user_id or not text:
        emit("error", {"message": "roomId, userId and text are required"})
        return

    doc = {
        "room_id": room,
        "user_id": user_id,
        "role": role,
        "text": text,
        "timestamp": datetime.datetime.utcnow()
    }
    inserted = messages.insert_one(doc)
    doc["_id"] = str(inserted.inserted_id)

    emit("message", doc, room=room)

@socketio.on("leave")
def handle_leave(data):
    room = data.get("roomId")
    name = data.get("name", "Someone")
    if room:
        leave_room(room)
        emit("system", {"msg": f"{name} left", "roomId": room}, room=room)

# --- Run Server ---
if __name__ == "__main__":
    import eventlet
    socketio.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
