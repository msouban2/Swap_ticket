from utils.db import db
from datetime import datetime

tickets_collection = db["tickets"]

def create_ticket(user_id, category, subcategory, city, details):
    ticket = {
        "user_id": user_id,
        "category": category,        # Travel, Movie, Event, etc.
        "subcategory": subcategory,  # Train, Bus, etc.
        "city": city,
        "details": details,          # Dict with ticket-specific fields
        "timestamp": datetime.utcnow(),
    }
    result = tickets_collection.insert_one(ticket)
    ticket["_id"] = str(result.inserted_id)
    return ticket

def get_tickets(category=None, user_id=None, city=None):
    query = {}
    if category:
        query["category"] = category
    if user_id:
        query["user_id"] = user_id
    if city:
        query["city"] = city

    tickets = list(tickets_collection.find(query))
    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
    return tickets
