from routes.data_routes import data_bp
from routes.anomaly_routes import anomaly_bp
from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
import sys

# Ensure Windows console can print unicode safely (prevents 'charmap' errors)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
        sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

# Load environment variables from .env file
load_dotenv()

# Import blueprints from the routes package
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.gov_verify_routes import gov_verify_bp
from routes.image_routes import image_bp
from routes.booth_allocation import booth_allocation_bp

# Initialize Flask App
app = Flask(__name__)


# --- Configuration ---
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/voter_auth_db")
CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize PyMongo and attach it to the app
mongo = PyMongo(app)
app.mongo = mongo # Make mongo accessible in blueprints via current_app

#Register Blueprints
# This organizes the routes into separate files for better maintainability
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(data_bp, url_prefix='/api/data') # For dashboard and AI routes
app.register_blueprint(gov_verify_bp, url_prefix='/api/auth')
app.register_blueprint(image_bp, url_prefix='/api/admin')
app.register_blueprint(booth_allocation_bp, url_prefix='/api/booth-allocation') 
app.register_blueprint(anomaly_bp, url_prefix="/api/data/ai")
# app.register_blueprint(data_bp)
#Root Route 
@app.route('/')
def index():
    """A simple route to confirm the backend is running."""
    return {"status": "running", "message": "AI Voter Authentication Backend"}

#Main Execution
if __name__ == '__main__':
    # Disable the reloader on Windows so heavyweight ML imports do not run twice.
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
    #venv\Scripts\activate
    #pip install -r requirements.txt
