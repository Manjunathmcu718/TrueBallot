import os
from pathlib import Path
from twilio.rest import Client
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = BACKEND_DIR.parent

load_dotenv(PROJECT_DIR / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env", override=True)

twilio_client = None

def get_twilio_client():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    
    if not account_sid or not auth_token:
        print("Warning: Twilio credentials not found in .env file. SMS will be printed to console.")
        return None
    
    return Client(account_sid, auth_token)

def normalize_phone_number(to_number):
    phone = str(to_number or "").strip().replace(" ", "").replace("-", "")

    if phone.startswith("+"):
        return phone

    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"

    return f"+91{phone}"

def send_sms(to_number, body):
    global twilio_client

    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    formatted_to_number = normalize_phone_number(to_number)

    if twilio_client is None:
        twilio_client = get_twilio_client()

    if not twilio_client or not from_number:
        print("-" * 50)
        print(f"SIMULATED SMS to {formatted_to_number}")
        print(f"BODY: {body}")
        print("-" * 50)
        return {
            "success": False,
            "simulated": True,
            "error": "Twilio credentials or TWILIO_PHONE_NUMBER are missing.",
            "to": formatted_to_number
        }

    try:
        message = twilio_client.messages.create(
            body=body,
            from_=from_number,
            to=formatted_to_number
        )
        print(f"Twilio SMS sent to {formatted_to_number}. SID: {message.sid}")
        return {"success": True, "sid": message.sid, "to": formatted_to_number}
    except Exception as e:
        print(f"Twilio SMS Error: {e}")
        return {"success": False, "error": str(e), "to": formatted_to_number}
