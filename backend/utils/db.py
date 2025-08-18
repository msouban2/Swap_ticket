from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read from .env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/TicketSwap")

# Create Mongo client
client = MongoClient(MONGO_URI)

# If DB name is inside URI, no need for DB_NAME
# It will automatically use `TicketSwap` from the URI
db = client.get_database()
