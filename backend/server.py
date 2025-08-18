from flask import Flask, request, jsonify
from pymongo import MongoClient
import pytesseract
from PIL import Image
import os
import requests
import datetime
from flask_cors import CORS
from models.chatrooms import create_chatroom
from models.messages import add_message
from models.tickets import create_ticket, get_tickets
from routes.chatrooms import chatrooms_bp
from routes.messages import messages_bp
from routes.tickets import tickets_bp

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["ticket_app"]

# Ollama API config
OLLAMA_API_URL = "http://localhost:11434/api/generate"  # Local Ollama endpoint
OLLAMA_MODEL = "mistral"  # Change to your installed model

# (Optional) Path for Windows Tesseract
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# Register blueprints
app.register_blueprint(chatrooms_bp)
app.register_blueprint(messages_bp)
app.register_blueprint(tickets_bp)


@app.route("/")
def home():
    return {"msg": "Server is running"}


@app.route("/process_ticket", methods=["POST"])
def process_ticket():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        file_ext = file.filename.split(".")[-1].lower()
        temp_path = f"temp_upload.{file_ext}"
        
        # Save uploaded file
        file.save(temp_path)

        # OCR: Extract text from image
        image = Image.open(temp_path)
        extracted_text = pytesseract.image_to_string(image)

        os.remove(temp_path)

        # Send extracted text to Ollama
        prompt = f"Extract ticket details from this text and return valid JSON:\n{extracted_text}"
        ollama_response = requests.post(
            OLLAMA_API_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, }
        )

        if ollama_response.status_code != 200:
            return jsonify({"error": "Ollama request failed", "details": ollama_response.text}), 500

        ollama_output = ollama_response.json().get("response", "").strip()

        # Save to MongoDB
        ticket_doc = {
            "ocr_text": extracted_text.strip(),
            "ollama_summary": ollama_output,
            "created_at": datetime.datetime.utcnow()
        }
        result = db.tickets.insert_one(ticket_doc)

        return jsonify({
            "ticket_id": str(result.inserted_id),
            "ocr_text": extracted_text.strip(),
            "ollama_summary": ollama_output
            
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
