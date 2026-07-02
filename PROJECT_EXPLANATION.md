# AI Voter Authentication System - Full Code Explanation

## Purpose Of The Project
This project is a full-stack AI Voter Authentication System. It helps an election admin register voters, upload voter photos, allocate voters to polling booths, authenticate voters, verify OTPs, compare faces, record votes, and monitor voting statistics/anomalies.

The system has three main parts:

- Backend: Flask API in `backend/`
- Database: MongoDB running locally on `mongodb://127.0.0.1:27017/voter_auth_db`
- Frontend: React app in `frontend/`

## How The Project Runs
The repository includes Windows batch scripts:

- `start-mongodb.bat` starts MongoDB using `mongo-data-real` as the database folder.
- `start-backend.bat` starts Flask on `http://127.0.0.1:5000`.
- `start-frontend.bat` starts React on `http://localhost:3000`.
- `run-project.bat` opens all three services.

Example:

1. Run `run-project.bat`
2. Open `http://localhost:3000`
3. React calls Flask APIs at `http://localhost:5000`
4. Flask reads/writes MongoDB collections such as `voters`, `booths`, `anomalies`, and `locality_booth_mapping`

## Main User Flow
1. Admin adds a booth.
2. Admin adds a voter with Voter ID, Aadhaar, phone number, address, constituency, polling station, and optional photo.
3. Voter enters Voter ID, Aadhaar, and phone number.
4. Government ID verification is simulated.
5. Face verification compares stored voter photo with live webcam photo.
6. Backend sends an OTP through Twilio or reports SMS failure/simulation.
7. Voter enters OTP.
8. Voter records vote.
9. Dashboard updates vote counts and anomaly reports.

## Backend Architecture
The backend uses Flask blueprints. A blueprint is a group of related API routes kept in a separate file. `backend/app.py` connects all blueprints to the main Flask app.

Registered API groups:

- `/api/auth`: voter authentication, OTP, vote recording, government verification
- `/api/admin`: admin voter/booth management and image upload
- `/api/data`: dashboard stats, voter export, basic anomaly APIs
- `/api/data/ai`: advanced anomaly detection APIs
- `/api/booth-allocation`: locality-to-booth mapping APIs
- `/api/voter-analysis` and `/api/analysis/voter-categories`: voter analysis APIs

## Database Collections
The code uses these MongoDB collections:

- `voters`: voter records, voting status, OTP fields, photo GridFS ID
- `booths`: polling booth records
- `anomalies`: detected anomaly records
- `locality_booth_mapping`: locality names mapped to booth IDs
- GridFS collections: stores uploaded voter photos

Example voter document:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "full_name": "Rahul Sharma",
  "date_of_birth": "1998-05-20",
  "address": "Keshav Nagar, Delhi",
  "constituency": "Delhi Central",
  "polling_station": "BOOTH001",
  "age": 27,
  "has_voted": false,
  "image_id": "Mongo GridFS ObjectId"
}
```

# Root Files

## README.md
This is a very small project title file. It identifies the repository as `voter-auth-project`.

Example use:

```text
# voter-auth-project
```

## run-project.bat
This is the all-in-one launcher. It opens MongoDB, backend, and frontend in separate command windows.

Important code idea:

```bat
start "Voter Auth MongoDB" cmd /k "%~dp0start-mongodb.bat"
start "Voter Auth Backend" cmd /k "%~dp0start-backend.bat"
start "Voter Auth Frontend" cmd /k "%~dp0start-frontend.bat"
```

Explanation:

- `%~dp0` means the folder where the batch file is located.
- Each `start` command opens a separate terminal.
- `cmd /k` keeps the terminal open so you can see logs.

## start-mongodb.bat
This script starts the MongoDB server.

Important code idea:

```bat
"%MONGOD%" --dbpath "%DBPATH%" --bind_ip 127.0.0.1 --port 27017
```

Explanation:

- `MONGOD` points to the installed MongoDB executable.
- `DBPATH` points to `mongo-data-real`.
- MongoDB listens only on local machine address `127.0.0.1`.
- Logs are written to `backend/mongod.projectdata.log`.

Example:

```text
mongodb://127.0.0.1:27017/voter_auth_db
```

## start-backend.bat
This script starts the Flask backend.

Important code idea:

```bat
cd /d "%~dp0backend"
"%~dp0.venv\Scripts\python.exe" app.py
```

Explanation:

- Changes directory into `backend`.
- Uses the project virtual environment Python.
- Starts `backend/app.py`.
- Sets BLAS thread variables to `1` to keep heavy ML libraries lighter.

## start-frontend.bat
This script starts the React frontend.

Important code idea:

```bat
cd /d "%~dp0frontend"
set "BROWSER=none"
call npm start
```

Explanation:

- Changes directory into `frontend`.
- Prevents React from automatically opening a browser.
- Starts the development server on `http://localhost:3000`.

## test.txt
This is a simple test/plain text file. It is not used by the application logic.

# Backend Files

## backend/app.py
This is the backend entry point. It creates the Flask app, connects MongoDB, enables CORS, and registers all route blueprints.

Important code:

```python
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/voter_auth_db")
CORS(app)
mongo = PyMongo(app)
app.mongo = mongo
```

Explanation:

- `Flask(__name__)` creates the web server application.
- `MONGO_URI` is read from `.env`; if missing, a local MongoDB URL is used.
- `CORS(app)` allows the React app on port 3000 to call the Flask API on port 5000.
- `app.mongo = mongo` makes MongoDB available inside blueprints through `current_app.mongo`.

Blueprint registration:

```python
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(data_bp, url_prefix='/api/data')
```

Example:

- `auth_bp` has route `/authenticate`
- Registered with `/api/auth`
- Final URL becomes `/api/auth/authenticate`

Root route:

```python
@app.route('/')
def index():
    return {"status": "running", "message": "AI Voter Authentication Backend"}
```

Example response:

```json
{
  "status": "running",
  "message": "AI Voter Authentication Backend"
}
```

## backend/.env and backend/.env.example
These files store environment variables, especially MongoDB and Twilio settings.

Typical values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/voter_auth_db
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

Explanation:

- `.env` contains real local credentials and should not be shared publicly.
- `.env.example` is a template showing what variables are required.

## backend/requirements.txt
This file lists Python dependencies.

Important packages:

- `Flask`: web API framework
- `Flask-CORS`: allows frontend-backend communication
- `Flask-PyMongo`: MongoDB integration
- `python-dotenv`: loads `.env`
- `twilio`: sends OTP SMS
- `Pillow`: image processing
- `opencv-python-headless`: image validation and anti-spoof checks
- `deepface`: face recognition
- `requests`: fetches remote images

Example install command:

```bat
pip install -r backend/requirements.txt
```

## backend/seed_database.py
This script fills MongoDB with sample voters and booths using Faker/random data.

Important code idea:

```python
client = MongoClient(...)
db = client["voter_auth_db"]
```

Explanation:

- Connects to MongoDB.
- Creates realistic sample voter names, phone numbers, Aadhaar numbers, addresses, booths, and vote statuses.
- Useful for demo and testing dashboard/anomaly features.

Example generated voter:

```json
{
  "voter_id": "DEL1234567",
  "aadhar_number": "987654321012",
  "phone_number": "9876543210",
  "has_voted": false
}
```

## backend/routes/auth_routes.py
This file handles voter login, OTP verification, vote recording, and face comparison.

### `authenticate_voter`
Route:

```text
POST /api/auth/authenticate
```

What it does:

- Reads `voter_id`, `aadhar_number`, and `phone_number`.
- Finds the matching voter in MongoDB.
- Checks voter age.
- Rejects under-18 voters.
- If already voted, returns `already_voted`.
- If live face image is provided, compares it with stored image.
- Generates a 6-digit OTP.
- Stores OTP and expiry time in MongoDB.
- Sends OTP by SMS.

Example request:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "live_image_data": "data:image/jpeg;base64,..."
}
```

Example response:

```json
{
  "status": "otp_sent",
  "voter_id": "mongo_object_id",
  "message": "OTP sent to mobile ending in ******3210"
}
```

### `verify_otp`
Route:

```text
POST /api/auth/verify-otp
```

What it does:

- Finds voter by MongoDB `_id`.
- Checks if OTP exists.
- Checks whether OTP expired.
- Compares user-entered OTP with stored OTP.
- Removes OTP fields after success.

Example request:

```json
{
  "voter_id": "mongo_object_id",
  "otp": "123456"
}
```

### `record_vote`
Route:

```text
POST /api/auth/vote
```

What it does:

- Receives `voterId`.
- Marks `has_voted` as `true`.
- Adds `voting_timestamp`.
- Sends vote confirmation SMS.
- Prevents duplicate voting by returning existing record if voter already voted.

Example request:

```json
{
  "voterId": "mongo_object_id"
}
```

### `compare_faces_advanced`
Route:

```text
POST /api/auth/compare-faces
```

What it does:

- Receives stored image URL/base64 and live image base64.
- Calls `AdvancedFaceVerification`.
- Returns match status, confidence, reason, and detailed scores.

## backend/routes/admin_routes.py
This file handles admin actions: voters, booths, image storage, and deletion.

### `manage_voters`
Route:

```text
GET /api/admin/voters
POST /api/admin/voters
```

GET:

- Returns all voters sorted by newest first.
- Converts MongoDB ObjectId to string for JSON.

POST:

- Validates Voter ID, Aadhaar, phone number, and address.
- Checks duplicates.
- Validates optional photo using `VoterImageValidator`.
- Stores photo in GridFS.
- Inserts voter in MongoDB.

Example request:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "full_name": "Anita Verma",
  "date_of_birth": "1999-04-15",
  "constituency": "Delhi Central",
  "polling_station": "BOOTH001",
  "address": "Gandhi Nagar, Delhi",
  "image": "data:image/jpeg;base64,..."
}
```

### `add_voter`
Route:

```text
POST /api/admin/add-voter
```

This is a dedicated voter creation endpoint used by the React admin form. It validates required fields, inserts the voter first, then attaches an image if valid.

Why this design is useful:

- Voter creation can still succeed even if image validation fails.
- The response can show `image_uploaded: false` with image error details.

### `get_voter_image`
Route:

```text
GET /api/admin/voters/<voter_id>/image
```

What it does:

- Finds voter by MongoDB `_id`.
- Reads image from GridFS using `image_id`.
- Returns base64 data URL to frontend.

### `upload_voter_image`
Route:

```text
POST /api/admin/upload-voter-image
```

Standalone image upload endpoint.

### `delete_voter`
Route:

```text
DELETE /api/admin/voters/<voter_id>
```

What it does:

- Finds voter.
- Deletes associated GridFS photo if present.
- Deletes voter document.

### `manage_booths`
Route:

```text
GET /api/admin/booths
POST /api/admin/booths
```

GET returns booth list. POST inserts a new booth with `created_at`.

## backend/routes/data_routes.py
This file contains dashboard data, voter listing, CSV export, and a basic anomaly detector.

### `get_dashboard_stats`
Route:

```text
GET /api/data/dashboard/stats
```

What it calculates:

- Total voters
- Voted count
- Not voted count
- Voting percentage
- 10 most recent votes

Important code idea:

```python
total_voters = mongo.db.voters.count_documents({})
voted_count = mongo.db.voters.count_documents({"has_voted": True})
```

Example response:

```json
{
  "totalVoters": 100,
  "votedCount": 40,
  "notVotedCount": 60,
  "votingPercentage": 40.0,
  "recentVotes": []
}
```

### `get_voters`
Route:

```text
GET /api/data/voters
```

Returns up to 100 voters while hiding OTP fields.

### `detect_anomalies`
Route:

```text
POST /api/data/ai/detect-anomalies
```

This basic detector checks booth turnout:

- High turnout if turnout is above 95% and booth has more than 20 registered voters.
- Low turnout if turnout is below 10% and booth has more than 50 registered voters.

### `get_anomalies`
Route:

```text
GET /api/data/ai/anomalies
```

Returns anomaly documents sorted by latest detection time.

### `export_voters_csv`
Route:

```text
GET /api/data/export/voters-csv
```

Exports all voters as a CSV file.

Example output columns:

```text
aadhar_number,address,age,constituency,date_of_birth,full_name,has_voted,phone_number,polling_station,voter_id
```

## backend/routes/anomaly_routes.py
This file contains a more advanced demo anomaly detector registered under `/api/data/ai`.

Main route:

```text
POST /api/data/ai/ai/detect-anomalies
```

Note: Because `app.py` registers this blueprint with `/api/data/ai` and the file route also starts with `/ai`, the final path contains `/ai/ai`. The frontend currently calls `/api/data/ai/detect-anomalies`, which is handled by `data_routes.py`.

Detection types:

- High Turnout
- Low Turnout
- Duplicate Identity
- Location Mismatch
- Shared Phone Fraud
- Vote Spike

Example anomaly:

```json
{
  "booth_name": "BOOTH001",
  "detection_type": "Duplicate Identity",
  "details": "Duplicate Aadhar detected: 123456789012",
  "confidence_score": 0.98
}
```

Test routes:

- `POST /api/data/ai/test/high-turnout`
- `POST /api/data/ai/test/low-turnout`
- `POST /api/data/ai/test/duplicate-aadhar`
- `POST /api/data/ai/test/mark-20-voted`

These mutate sample data to demonstrate anomaly detection.

## backend/routes/analysis_routes.py
This file builds voter analysis data for both API and HTML view.

Important helper functions:

- `_serialize_value`: converts MongoDB/date values into JSON-safe values.
- `_serialize_voter`: serializes a complete voter object.
- `_build_analysis_payload`: groups voters into categories.

Routes:

```text
GET /api/voter-analysis
GET /api/analysis/voter-categories
GET /voter-analysis
```

The analysis payload separates voters into categories like voted and not voted, and computes summary values used by `VoterAnalysis.js` and `voter_analysis.html`.

Example response idea:

```json
{
  "total": 100,
  "voted": [],
  "not_voted": []
}
```

## backend/routes/booth_allocation.py
This file manages automatic and manual polling booth allocation based on localities extracted from voter addresses.

### `create_mapping`
Route:

```text
POST /api/booth-allocation/create-mapping
```

Creates or updates a booth mapping.

Example request:

```json
{
  "booth_id": "BOOTH001",
  "booth_name": "Central School",
  "locality_names": ["Keshav Nagar", "Gandhi Nagar"]
}
```

The code normalizes localities to lowercase:

```python
normalized_localities = [name.strip().lower() for name in locality_names]
```

### `get_mappings`
Route:

```text
GET /api/booth-allocation/mappings
```

Returns all locality-to-booth mappings.

### `delete_mapping`
Route:

```text
DELETE /api/booth-allocation/delete-mapping/<booth_id>
```

Deletes a mapping by booth ID.

### `auto_allocate_booth`
Route:

```text
POST /api/booth-allocation/auto-allocate
```

Checks whether a known locality appears inside an address.

Example:

```json
{
  "address": "House 12, Keshav Nagar, Delhi"
}
```

If `keshav nagar` exists in mapping, it returns the mapped booth.

### `bulk_analyze`
Route:

```text
POST /api/booth-allocation/bulk-analyze
```

Analyzes multiple addresses at once.

### `get_booth_stats`
Route:

```text
GET /api/booth-allocation/stats
```

Returns total mapped booths and total localities covered.

### `auto_generate_allocations`
Route:

```text
POST /api/booth-allocation/auto-generate
```

Reads all voter addresses, extracts locality patterns such as `nagar`, `colony`, `vihar`, `puram`, and groups localities into booths.

Example regex idea:

```python
r'(\w+\s*nagar)'
```

This can extract values like `keshav nagar`.

## backend/routes/gov_verify_routes.py
This file simulates government database verification.

Functions:

- `simulate_uidai_verification`: simulates Aadhaar check.
- `simulate_eci_verification`: simulates Election Commission voter ID check.
- `verify_ids`: combines both results.

Route:

```text
POST /api/auth/verify-government-ids
```

Example request:

```json
{
  "aadhar_number": "123456789012",
  "voter_id": "ABC1234567",
  "full_name": "Anita Verma"
}
```

Simulation rules:

- Aadhaar ending in `0` returns forged.
- Aadhaar ending in `1` or `2` returns suspicious.
- Voter ID starting with `XXX` returns forged.
- Voter ID starting with `SUS` returns suspicious.
- Otherwise records are verified.

Example response:

```json
{
  "success": true,
  "overall_status": "VERIFIED",
  "verification_report": {
    "uidai_aadhaar": {"status": "VERIFIED"},
    "eci_voter_id": {"status": "VERIFIED"}
  }
}
```

## backend/routes/image_routes.py
This file provides image upload/retrieval endpoints. It overlaps with image features in `admin_routes.py`.

Routes:

```text
POST /api/admin/upload-voter-image
GET /api/admin/get-voter-image/<voter_id>
```

What it does:

- Validates image with `VoterImageValidator`.
- Decodes base64 image.
- Stores image in MongoDB GridFS.
- Retrieves stored image as base64 for frontend display.

Example response:

```json
{
  "success": true,
  "image_id": "gridfs_object_id",
  "message": "Image uploaded and validated successfully"
}
```

## backend/services/advanced_face_verification.py
This file contains the face matching and anti-spoofing logic.

Class:

```python
class AdvancedFaceVerification:
```

### `_load_deepface`
Loads DeepFace only when needed. This is useful because DeepFace/TensorFlow can be slow and heavy at startup.

### `detect_anti_spoof`
Checks whether the live image may be a spoof/photo/screen replay.

Checks used:

- Glare ratio: too many bright white pixels may mean screen glare.
- Texture variance: very low texture can mean flat photo.
- Edge density: low edge count can mean unnatural/washed image.

Example output:

```json
{
  "is_real": true,
  "confidence": 80.0,
  "indicators": []
}
```

### `comprehensive_verification`
Main face verification function.

What it does:

1. Loads stored image from URL or base64 data URL.
2. Loads live image from base64.
3. Runs anti-spoof checks.
4. Uses DeepFace Facenet model to compare faces.
5. Computes final confidence using embedding score, geometry score, and anti-spoof score.

Important code idea:

```python
result = DeepFace.verify(stored_cv, live_cv, model_name='Facenet', enforce_detection=True)
```

Example result:

```json
{
  "match": true,
  "confidence": 0.82,
  "reason": "Verification successful",
  "detailed_scores": {
    "face_embedding_score": "78.5%",
    "geometry_score": "88.0%",
    "anti_spoof_score": "90.0%",
    "final_confidence": "82.4%"
  }
}
```

## backend/utils/validation.py
This file contains small validation helper functions.

### `validate_aadhaar`
Checks whether Aadhaar is exactly 12 digits.

Example:

```python
validate_aadhaar("123456789012")  # True
validate_aadhaar("12345")         # False
```

### `validate_voter_id`
Checks voter ID pattern: 3 uppercase letters followed by 7 digits.

Example:

```python
validate_voter_id("ABC1234567")  # True
validate_voter_id("AB123")       # False
```

### `validate_indian_phone`
Checks 10-digit Indian phone number starting with 6, 7, 8, or 9.

Example:

```python
validate_indian_phone("9876543210")  # True
validate_indian_phone("1234567890")  # False
```

### `calculate_age`
Calculates age from `YYYY-MM-DD`.

Example:

```python
calculate_age("2000-05-20")
```

## backend/utils/sms.py
This file sends SMS through Twilio.

### `get_twilio_client`
Reads Twilio credentials from environment variables and creates a Twilio client.

### `normalize_phone_number`
Converts Indian phone numbers to international format.

Example:

```python
normalize_phone_number("9876543210")
```

Output:

```text
+919876543210
```

### `send_sms`
Sends an SMS if Twilio credentials exist.

Important behavior:

- If Twilio credentials are missing, it prints a simulated SMS and returns failure/simulated status.
- If Twilio sends successfully, it returns the Twilio SID.

Example:

```python
send_sms("9876543210", "Your OTP is 123456")
```

## backend/utils/image_validator.py
This file validates uploaded voter photos.

Class:

```python
class VoterImageValidator:
```

Validation rules:

- File size should be 50KB to 100KB.
- Format must be JPEG/JPG/PNG.
- Photo dimensions should match 4.5cm by 3.5cm at 300 DPI with 10% tolerance.
- Image should not be tilted.
- Image should not be blurred.
- Exactly one face should be detected.
- Face should occupy 30% to 70% of image height.

Example:

```python
validator = VoterImageValidator()
result = validator.validate_image("data:image/jpeg;base64,...")
```

Example result:

```json
{
  "valid": false,
  "errors": ["Image appears blurred. Please upload a clear, sharp image."]
}
```

## backend/utils/__init__.py
This file is empty. Its purpose is to make `utils` behave like a Python package so files can import from `utils.validation`, `utils.sms`, etc.

## backend/templates/voter_analysis.html
This is a Flask-rendered HTML page for voter analysis.

What it contains:

- HTML layout for analysis results.
- CSS styling.
- Template placeholders/data rendered from Flask.

Route using it:

```text
GET /voter-analysis
```

Explanation:

- This is separate from React.
- It can be opened directly from the Flask backend.
- It is useful for quickly viewing analysis without the React UI.

# Frontend Files

## frontend/package.json
This file defines the React project dependencies and scripts.

Important dependencies:

- `react` and `react-dom`: UI framework
- `react-router-dom`: page routing
- `axios`: API calls
- `framer-motion`: animations
- `lucide-react`: icons
- `react-scripts`: Create React App tooling
- `tailwindcss`: utility CSS framework

Scripts:

```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test"
}
```

Example:

```bat
npm start
```

## frontend/package-lock.json
This locks exact dependency versions. It is generated by npm and ensures the same package versions install on another machine.

You usually do not manually edit this file.

## frontend/tailwind.config.js
This configures Tailwind CSS scanning and custom colors.

Important code:

```javascript
colors: {
  'saffron': '#FF9933',
  'green': '#138808',
  'navy': '#000080',
}
```

Explanation:

- These colors match the Indian flag theme used in the UI.
- Tailwind scans `src/**/*.{js,jsx,ts,tsx}` for class names.

Example class:

```jsx
<span className="text-saffron">AI</span>
```

## frontend/public/index.html
This is the base HTML page for the React app.

Important code:

```html
<div id="root"></div>
```

Explanation:

- React injects the whole app inside the `root` div.
- `frontend/src/index.js` connects React to this element.

## frontend/src/index.js
This is the React entry point.

Important code:

```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

Explanation:

- Finds the `root` element from `index.html`.
- Renders the top-level `App` component.

## frontend/src/index.css
This file loads Tailwind CSS layers and global styles.

Typical Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Explanation:

- Makes Tailwind utility classes available throughout React.
- May also contain global body/background/font styling.

## frontend/src/App.js
This file defines the main layout and routes.

Main components:

- `Layout`: header, navigation, footer, and page wrapper.
- `App`: sets up React Router routes.

Important routes:

```jsx
<Route path="/" element={<VoterAuth />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/admin" element={<Admin />} />
<Route path="/booth-allocation" element={<BoothAllocation />} />
```

Explanation:

- `/` shows voter login/authentication.
- `/dashboard` shows voting statistics and anomalies.
- `/admin` shows admin voter/booth management.
- `/booth-allocation` shows booth locality mapping.

Navigation example:

```jsx
{ name: "Voter Login", path: "/", icon: Shield }
```

The code maps this array into clickable links.

## frontend/src/pages/VoterAuth.js
This is the main voter-side page. It controls the multi-step voting flow.

Major state values:

- `step`: current screen/stage.
- `voterData`: authenticated voter record.
- `voterIdForOTP`: MongoDB voter ID used during OTP verification.
- `otpSmsStatus`: SMS sending status.
- `error`: error message.
- `isLoading`: loading state.

Main flow:

1. User fills credentials in `AuthForm`.
2. Government verification component runs.
3. Face verification captures webcam image.
4. Backend `/api/auth/authenticate` sends OTP.
5. User enters OTP in `OTPVerification`.
6. Backend `/api/auth/verify-otp` verifies OTP.
7. User confirms vote in `VotingStatus`.
8. Backend `/api/auth/vote` records the vote.

Important API call:

```javascript
fetch('http://localhost:5000/api/auth/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
```

Example payload:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "live_image_data": "data:image/jpeg;base64,..."
}
```

## frontend/src/pages/Admin.js
This page is the admin panel.

Main responsibilities:

- Fetch voters and booths.
- Show forms for adding voters and booths.
- Search/filter voters.
- Delete voters.
- Show success/error notifications.

Important API calls:

```javascript
axios.get('http://localhost:5000/api/admin/voters')
axios.get('http://localhost:5000/api/admin/booths')
axios.post('http://localhost:5000/api/admin/add-voter', voterData)
axios.delete(`http://localhost:5000/api/admin/voters/${voterId}`)
```

Example:

When admin submits Add Voter form, `Admin.js` sends the form data to Flask and refreshes the table after success.

## frontend/src/pages/Dashboard.js
This page shows election statistics and anomaly detection.

Main state values:

- `stats`: total voters, voted count, not voted count, voting percentage, recent votes.
- `anomalies`: anomaly list from backend.
- `isLoading`: page loading status.
- `isDetecting`: anomaly detection button loading status.

Important API calls:

```javascript
axios.get('http://localhost:5000/api/data/dashboard/stats')
axios.get('http://localhost:5000/api/data/ai/anomalies')
axios.post('http://localhost:5000/api/data/ai/detect-anomalies')
```

Example:

Clicking the detect anomalies button calls the backend detection route, then reloads anomaly data.

## frontend/src/pages/BoothAllocation.js
This page manages booth allocation mappings.

Main responsibilities:

- Fetch existing mappings.
- Fetch booths from admin API.
- Add locality-to-booth mapping.
- Delete mapping.
- Auto-generate mappings from voter addresses.
- Display summary and results.

Important API calls:

```javascript
axios.get('http://localhost:5000/api/booth-allocation/mappings')
axios.get('http://localhost:5000/api/admin/booths')
axios.post('http://localhost:5000/api/booth-allocation/create-mapping', data)
axios.delete(`http://localhost:5000/api/booth-allocation/delete-mapping/${boothId}`)
axios.post('http://localhost:5000/api/booth-allocation/auto-generate')
```

Example mapping:

```json
{
  "booth_id": "BOOTH001",
  "booth_name": "Polling Station 1",
  "locality_names": ["keshav nagar", "gandhi nagar"]
}
```

## frontend/src/components/VoterAnalysis.js
This component fetches and displays voter categories.

Important API call:

```javascript
fetch('http://localhost:5000/api/analysis/voter-categories')
```

What it does:

- Shows loading state.
- Stores returned data in `data`.
- Tracks active tab with `activeTab`.
- Displays voter categories such as voted/not voted.

Example:

If active tab is `voted`, it displays voters who have already cast their vote.

## frontend/src/components/admin/AddVoterForm.js
This component renders the form for adding a voter.

Main fields:

- Voter ID
- Aadhaar number
- Phone number
- Full name
- Date of birth
- Address
- Constituency
- Polling station
- Face image

Important feature:

- It can call booth auto-allocation before submitting.
- It sends voter data to parent `Admin.js` through `onSubmit`.

Example form data:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "full_name": "Anita Verma",
  "date_of_birth": "1999-04-15",
  "address": "Keshav Nagar, Delhi"
}
```

## frontend/src/components/admin/AddBoothForm.js
This component renders the form for adding a booth.

Main fields:

- Booth ID/name
- Location/address information
- Capacity or booth details depending on UI fields

What it does:

- Stores form input in React state.
- Calls `onSubmit` when admin submits.
- Calls `onCancel` when admin closes form.

Example:

```json
{
  "booth_name": "Central School Booth",
  "location": "Keshav Nagar"
}
```

## frontend/src/components/admin/VoterTable.js
This component displays voters in a table.

Main responsibilities:

- Shows voter rows.
- Shows loading/empty states.
- Displays whether voter has a photo.
- Opens delete confirmation dialog.
- Calls parent callback for delete.

Props:

- `voters`
- `isLoading`
- `onRefresh`
- `onDeleteVoter`

Example:

```jsx
<VoterTable voters={voters} isLoading={isLoading} onRefresh={fetchData} />
```

## frontend/src/components/admin/DeleteConfirmDialog.js
This component shows a confirmation modal before deleting a voter.

Props:

- `isOpen`: whether modal is visible.
- `onConfirm`: delete action.
- `onCancel`: close modal.
- `voterName`: name displayed in dialog.
- `hasPhoto`: warns that photo will also be deleted.

Example:

```jsx
<DeleteConfirmDialog
  isOpen={deleteDialogOpen}
  onConfirm={handleDelete}
  onCancel={closeDialog}
  voterName="Anita Verma"
/>
```

## frontend/src/components/admin/ImageUpload.js
This component handles admin-side voter photo upload UI.

Features:

- Drag and drop upload.
- File picker upload.
- Image preview.
- Client-side validation state.
- Validation error display.
- Calls `onImageChange` to pass selected image to parent form.

Important state:

- `image`
- `imagePreview`
- `validationErrors`
- `isValidating`
- `dragActive`

Example:

```jsx
<ImageUpload onImageChange={setFaceImage} />
```

## frontend/src/components/voter/AuthForm.js
This component is the first voter login form.

Fields:

- Voter ID
- Aadhaar number
- Phone number

Props:

- `onSubmit`: called with form data.
- `isLoading`: disables UI while backend is processing.

Example:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210"
}
```

## frontend/src/components/voter/GovernmentVerification.js
This component shows simulated UIDAI and ECI verification.

What it does:

- Receives `formData`.
- Calls `/api/auth/verify-government-ids`.
- Shows progress bar/status badges.
- Calls `onComplete` when verification finishes.

Important API call:

```javascript
fetch('http://localhost:5000/api/auth/verify-government-ids', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

Possible statuses:

- `VERIFIED`
- `REJECTED`
- `FLAGGED_FOR_REVIEW`

## frontend/src/components/voter/FaceVerification.js
This component captures a live webcam image.

Main features:

- Requests camera access.
- Shows live video preview.
- Captures frame into a canvas.
- Converts captured image to base64.
- Sends captured image to parent via `onVerify`.

Important browser APIs:

```javascript
navigator.mediaDevices.getUserMedia({ video: true })
canvas.toDataURL('image/jpeg')
```

Example captured output:

```text
data:image/jpeg;base64,/9j/4AAQSk...
```

## frontend/src/components/voter/OTPVerification.js
This component lets the voter enter the OTP.

Features:

- OTP input.
- 5-minute countdown timer.
- Back button.
- Shows SMS status.
- Calls `onVerify(otp)` when submitted.

Important state:

```javascript
const [otp, setOtp] = useState('');
const [timeLeft, setTimeLeft] = useState(300);
```

Example:

```jsx
<OTPVerification onVerify={handleOTPVerify} />
```

## frontend/src/components/voter/VotingStatus.js
This component shows voter details after OTP verification and lets the voter cast vote.

Props:

- `voterData`: verified voter record.
- `onVote`: records vote.
- `onReset`: starts over.
- `isLoading`: disables actions during API call.

What it displays:

- Voter name
- Voter ID
- Constituency
- Polling station
- Already voted / ready to vote status

Example:

```jsx
<VotingStatus voterData={voterData} onVote={handleVote} />
```

# End-To-End API Examples

## Add Voter
Request:

```http
POST /api/admin/add-voter
Content-Type: application/json
```

Body:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "full_name": "Anita Verma",
  "date_of_birth": "1999-04-15",
  "address": "Keshav Nagar, Delhi",
  "constituency": "Delhi Central",
  "polling_station": "BOOTH001"
}
```

## Authenticate Voter
Request:

```http
POST /api/auth/authenticate
```

Body:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210"
}
```

## Verify OTP
Request:

```http
POST /api/auth/verify-otp
```

Body:

```json
{
  "voter_id": "mongo_object_id",
  "otp": "123456"
}
```

## Record Vote
Request:

```http
POST /api/auth/vote
```

Body:

```json
{
  "voterId": "mongo_object_id"
}
```

## Dashboard Stats
Request:

```http
GET /api/data/dashboard/stats
```

Response:

```json
{
  "totalVoters": 100,
  "votedCount": 40,
  "notVotedCount": 60,
  "votingPercentage": 40.0
}
```

# Important Notes For Viva Or Presentation

## Why Flask?
Flask is lightweight and easy to organize using blueprints. This project uses Flask as a REST API server for React.

## Why MongoDB?
MongoDB stores flexible voter documents. It also supports GridFS, which is used to store voter photos.

## Why React?
React makes it easier to create a multi-page, interactive UI with stateful forms, dashboards, modals, and step-based authentication.

## Why OTP?
OTP adds a second authentication factor. Even if someone knows the Voter ID and Aadhaar, they still need the registered phone.

## Why Face Verification?
Face verification adds biometric identity checking. The system compares the stored voter photo with a live webcam photo before sending OTP.

## Why Anomaly Detection?
Anomaly detection helps admins identify suspicious voting behavior, such as duplicate identity, shared phone number, unusual turnout, or vote spikes.

# Generated And Runtime Files Not Explained Line-By-Line
The following are intentionally not explained as source code because they are generated or runtime data:

- `frontend/node_modules/`: installed npm dependencies
- `frontend/build/`: production build output
- `backend/venv/`, `.venv/`, `.venv-1/`: Python virtual environments
- `mongo-data-real/`: MongoDB database engine files
- `*.log` and `*.err`: runtime logs
- `__pycache__/`: Python bytecode cache

These files are required for running the project locally, but they are not handwritten project logic.
