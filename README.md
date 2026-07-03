# TrueBallot - AI Voter Authentication System

TrueBallot is a full-stack voter authentication and election monitoring portal built to improve the reliability of voter verification in a digital polling workflow. The project combines voter registration, ESP32 fingerprint-based biometric verification, government ID validation, face verification, OTP-based authentication, booth allocation, vote-status tracking, dashboard analytics, CSV export, and anomaly detection in one system.

The system is designed as an academic prototype for a real-life voter authentication portal. It demonstrates how election administrators can manage voter data and how voters can pass through multiple verification layers before their vote status is recorded.

> Note: This is a prototype/demo project. Government ID verification is simulated, and the system is not intended for production election deployment without security hardening, compliance review, and integration with official government services.

## Core Idea

Manual voter verification can be slow and error-prone, especially when large numbers of voters are processed at polling booths. TrueBallot addresses this by introducing a structured digital verification pipeline:

1. Admin registers voters and polling booths.
2. A fingerprint is enrolled using the ESP32/Arduino fingerprint sensor module for biometric identity mapping.
3. During entry or voting, the voter first verifies their fingerprint for fast identity confirmation.
4. If the fingerprint is not registered, the system can route the person to registration/enrollment.
5. Voter enters Voter ID, Aadhaar number, phone number, and name when required by the web flow.
6. System simulates government ID verification.
7. Voter can complete face verification or OTP verification as an additional fallback/security layer.
8. Vote status is recorded and duplicate voting is prevented.
9. If the same person tries to enter again or a fake entry is attempted, the stored biometric/voting status helps detect it quickly.
10. Admin dashboard tracks turnout, recent votes, anomalies, and voter data.

## Features

- Voter authentication using Voter ID, Aadhaar number, and phone number
- ESP32 fingerprint sensor integration for biometric enrollment and verification
- Fingerprint-based fast entry before voting or booth access
- Fingerprint enrollment for unregistered users
- Duplicate/fake entry detection using stored biometric identity and voting status
- Simulated UIDAI and ECI government ID verification
- Face verification using stored voter images and live webcam capture
- Anti-spoofing heuristics for live image checks
- OTP delivery through Twilio SMS
- Voter age eligibility check
- Duplicate voter registration prevention
- Vote recording with timestamp
- Duplicate voting prevention through `has_voted` status
- Admin panel for adding and deleting voters
- Polling booth management
- Voter photo upload, validation, and GridFS storage
- Automatic booth allocation from voter address/locality
- Dashboard statistics for total voters, voted voters, pending voters, and turnout
- Recent vote tracking
- CSV export of voter records
- AI-style anomaly detection for high turnout, low turnout, duplicate identities, shared phone numbers, and location mismatch
- Voter analysis categories for voted, not voted, and anomalous records

## Tech Stack

### Frontend

- React 18
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Axios / Fetch API

### Backend

- Python
- Flask
- Flask-CORS
- Flask-PyMongo
- MongoDB
- GridFS for image storage
- Twilio for SMS OTP
- OpenCV, Pillow, NumPy, DeepFace for face verification
- Pandas and scikit-learn support for analysis workflows

### Hardware / Firmware

- ESP32 microcontroller for the implemented fingerprint module
- Arduino UNO + R307 fingerprint sensor setup as described in the project report
- Fingerprint sensor module with template storage support, used here for around 127 fingerprint entries/templates
- Adafruit Fingerprint Sensor Library (`Adafruit_Fingerprint.h`)
- SoftwareSerial Library (`SoftwareSerial.h`) for UART communication in the Arduino-based setup
- PlatformIO or Arduino IDE for fingerprint firmware
- Serial/UART communication is used between the microcontroller and fingerprint sensor
- Serial/Wi-Fi based communication can be used to connect fingerprint verification results with the main voter authentication workflow

### Database

- MongoDB running locally on `mongodb://127.0.0.1:27017/voter_auth_db`

## Project Structure

```text
.
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   |-- routes/
|   |   |-- admin_routes.py
|   |   |-- analysis_routes.py
|   |   |-- anomaly_routes.py
|   |   |-- auth_routes.py
|   |   |-- booth_allocation.py
|   |   |-- data_routes.py
|   |   |-- gov_verify_routes.py
|   |   `-- image_routes.py
|   |-- services/
|   |   `-- advanced_face_verification.py
|   |-- templates/
|   |   `-- voter_analysis.html
|   `-- utils/
|       |-- image_validator.py
|       |-- sms.py
|       `-- validation.py
|-- frontend/
|   |-- package.json
|   |-- public/
|   `-- src/
|       |-- App.js
|       |-- components/
|       `-- pages/
|-- mongo-data-real/
|-- external fingerprint firmware, maintained separately in PlatformIO/Arduino IDE
|-- PROJECT_EXPLANATION.md
|-- run-project.bat
|-- start-backend.bat
|-- start-frontend.bat
`-- start-mongodb.bat
```

## Main Modules

### 1. Voter Authentication

Located mainly in `backend/routes/auth_routes.py` and `frontend/src/pages/VoterAuth.js`.

The voter authentication flow checks voter credentials, verifies eligibility, performs face matching when a live image is provided, generates an OTP, verifies the OTP, and records the vote status.

Important backend routes:

- `POST /api/auth/authenticate`
- `POST /api/auth/verify-otp`
- `POST /api/auth/vote`
- `POST /api/auth/compare-faces`

### 2. Fingerprint Biometric Verification

Implemented as a separate ESP32/Arduino hardware module using PlatformIO or Arduino IDE.

This module uses a microcontroller connected with a fingerprint sensor to enroll and verify voters through biometric fingerprints. In the project report, the biometric setup is described with an Arduino UNO, R307 fingerprint sensor, jumper wires, USB cable, optional breadboard, `Adafruit_Fingerprint.h`, and `SoftwareSerial.h`. In the hardware implementation, the same workflow can be run through an ESP32 and uploaded using PlatformIO or Arduino IDE.

During registration, the voter fingerprint is captured and assigned to a fingerprint template ID. The R307/sensor-side memory stores fingerprint templates, used here for around 127 stored fingerprint entries. During booth entry or voting, the voter places a finger on the sensor; if the fingerprint matches an enrolled template, the person is verified quickly without depending only on face verification or OTP.

The fingerprint module supports these main operations:

- Enrollment: if a person is not already registered in the sensor database, their fingerprint can be captured and stored against an available template ID.
- Enrollment scan: the same finger is scanned twice so the sensor can create a reliable fingerprint template.
- Verification: during entry or voting, the sensor captures the finger image, converts it into a template, and compares it with stored templates using 1:1 or 1:N matching.
- Result display: if a match is found, the microcontroller returns the voter/fingerprint match result, such as "Voter Found"; if already present or repeated, it can show duplicacy detection.

This makes the entry process faster and also helps detect duplicate or fake attempts. If a person has already entered or voted, the matched fingerprint ID can be checked against the voter record and `has_voted` status to prevent repeat access.

The fingerprint firmware is maintained separately from the Flask/React codebase, using PlatformIO or Arduino IDE.

### 3. Government ID Verification

Located in `backend/routes/gov_verify_routes.py`.

This module simulates external UIDAI and Election Commission verification. It validates Aadhaar and Voter ID formats, returns confidence-style responses, and marks records as verified, rejected, or flagged for review.

Important backend route:

- `POST /api/auth/verify-government-ids`

### 4. Admin Management

Located in `backend/routes/admin_routes.py` and `frontend/src/pages/Admin.js`.

Admins can add voters, validate voter details, upload voter photos, create booth records, list voters, and delete voter records. Uploaded voter photos are validated and stored in MongoDB GridFS.

Important backend routes:

- `GET /api/admin/voters`
- `POST /api/admin/voters`
- `POST /api/admin/add-voter`
- `DELETE /api/admin/voters/<voter_id>`
- `GET /api/admin/voters/<voter_id>/image`
- `GET /api/admin/booths`
- `POST /api/admin/booths`
- `POST /api/admin/upload-voter-image`

### 5. Booth Allocation

Located in `backend/routes/booth_allocation.py` and `frontend/src/pages/BoothAllocation.js`.

The booth allocation module maps localities to booth IDs and can auto-allocate a booth by matching locality names inside a voter's address. It also supports bulk address analysis and auto-generation of locality mappings from stored voter data.

Important backend routes:

- `POST /api/booth-allocation/create-mapping`
- `GET /api/booth-allocation/mappings`
- `DELETE /api/booth-allocation/delete-mapping/<booth_id>`
- `POST /api/booth-allocation/auto-allocate`
- `POST /api/booth-allocation/bulk-analyze`
- `GET /api/booth-allocation/stats`
- `POST /api/booth-allocation/auto-generate`

### 6. Dashboard, Export, and Analytics

Located in `backend/routes/data_routes.py`, `backend/routes/analysis_routes.py`, and the dashboard frontend components.

The dashboard provides voter statistics, recent votes, turnout percentage, anomaly records, and CSV export.

Important backend routes:

- `GET /api/data/dashboard/stats`
- `GET /api/data/voters`
- `GET /api/data/export/voters-csv`
- `GET /api/voter-analysis`
- `GET /api/analysis/voter-categories`

### 7. Anomaly Detection

Located in `backend/routes/anomaly_routes.py` and related data routes.

The anomaly module scans voter records and booth-wise voting patterns to detect suspicious conditions such as high turnout, low turnout, duplicate Aadhaar, shared phone numbers, location mismatch, and vote spikes.

Important backend routes:

- `POST /api/data/ai/ai/detect-anomalies`
- `GET /api/data/ai/ai/anomalies`
- `POST /api/data/ai/test/high-turnout`
- `POST /api/data/ai/test/low-turnout`
- `POST /api/data/ai/test/duplicate-aadhar`
- `POST /api/data/ai/test/mark-20-voted`

## Database Collections

The MongoDB database uses the following main collections:

- `voters`: voter records, ID details, phone number, DOB, address, booth, voting status, OTP fields, and image ID
- fingerprint template data or fingerprint template ID can be linked with voter records when the ESP32 biometric module is used
- `booths`: polling booth records
- `anomalies`: generated anomaly records
- `locality_booth_mapping`: locality-to-booth mappings
- GridFS collections: uploaded voter photos

Example voter document:

```json
{
  "voter_id": "ABC1234567",
  "aadhar_number": "123456789012",
  "phone_number": "9876543210",
  "full_name": "RAHUL SHARMA",
  "date_of_birth": "1998-05-20",
  "address": "Keshav Nagar, Delhi",
  "constituency": "Delhi Central",
  "polling_station": "BOOTH001",
  "age": 27,
  "has_voted": false,
  "fingerprint_id": 12,
  "image_id": "Mongo GridFS ObjectId"
}
```

## Prerequisites

- Windows machine
- Python virtual environment available at `.venv/`
- Node.js and npm
- MongoDB installed at:

```text
C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe
```

- Twilio account credentials if real SMS OTP delivery is required
- ESP32 board or Arduino UNO with R307 fingerprint sensor module for biometric verification
- PlatformIO or Arduino IDE for uploading fingerprint enrollment/verification firmware

## Environment Variables

Create a `.env` file in the project root or inside `backend/` with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/voter_auth_db
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

If Twilio credentials are missing, the SMS utility prints a simulated SMS message to the backend console, but the current OTP route treats missing/failed SMS delivery as an error response.

## Installation

### Backend

```bat
cd backend
..\.venv\Scripts\activate
pip install -r requirements.txt
```

Alternative direct command:

```bat
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Frontend

```bat
cd frontend
npm install
```

## Running the Project

The easiest way on Windows is:

```bat
run-project.bat
```

This opens MongoDB, Flask backend, and React frontend in separate terminals.

Service URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:5000`
- MongoDB: `mongodb://127.0.0.1:27017/voter_auth_db`

You can also start each service separately:

```bat
start-mongodb.bat
start-backend.bat
start-frontend.bat
```

## Frontend Pages

- `/` - Voter login and verification workflow
- `/dashboard` - Voting statistics, turnout, and analytics
- `/admin` - Voter and booth administration
- `/booth-allocation` - Locality-based booth mapping and allocation

## Typical Workflow

1. Start MongoDB, backend, and frontend.
2. Open `http://localhost:3000`.
3. Go to Admin Panel.
4. Add booths and voters with valid details.
5. Enroll voter fingerprint using the ESP32/Arduino R307 fingerprint sensor module.
6. Store or map the fingerprint template ID with the voter record.
7. Upload voter photos where needed.
8. During entry or voting, verify the voter fingerprint first for fast authentication.
9. If fingerprint is registered and not already used for voting, continue the voting flow.
10. Enter voter credentials when required.
11. Complete government verification.
12. Complete face verification or OTP verification when configured as an additional security layer.
13. Record vote.
14. Open Dashboard to monitor vote counts, turnout, recent votes, and anomalies.

## Validation Rules

The backend applies several validation checks:

- Voter ID format: 3 uppercase letters followed by 7 digits, for example `ABC1234567`
- Aadhaar number: 12 digits
- Indian phone number: 10 digits starting with 6, 7, 8, or 9
- Voter age: 18 years or above
- Duplicate check across Voter ID, Aadhaar number, and phone number
- Fingerprint template ID can be used to prevent repeat entry or duplicate voting
- Required address, constituency, polling station, and identity fields
- Image validation before storing voter photos

## Reports and Documentation

The repository includes `PROJECT_EXPLANATION.md`, which gives a detailed code-level explanation of the system.

The accompanying TrueBallot report PDFs describe the academic background, problem statement, requirement analysis, modeling, implementation, testing, findings, and future scope of the project. This README is based on the project codebase and those report details, without including group-member names.

Page 26 of the report specifically describes the biometric authentication module, including the Arduino UNO + R307 fingerprint sensor setup, `Adafruit_Fingerprint.h`, `SoftwareSerial.h`, UART communication, double-scan enrollment, 1:1/1:N matching, and serial monitor output for voter found/duplicacy cases.

## Limitations

- Government verification is simulated and not connected to real UIDAI or ECI systems.
- ESP32/Arduino fingerprint verification firmware is maintained separately from this React/Flask repository.
- Fingerprint integration depends on correct sensor wiring, serial/Wi-Fi communication, and reliable template ID mapping with voter records.
- OTP delivery depends on correct Twilio configuration.
- Face verification requires suitable image quality and installed ML dependencies.
- This prototype does not implement production-grade authentication, authorization, encryption, audit logging, or deployment security.
- MongoDB is configured for local development.
- Some anomaly detection thresholds are demo-oriented and should be tuned for real datasets.

## Future Scope

- Integrate official government verification APIs where legally and technically permitted
- Add role-based admin login and access control
- Add encrypted storage for sensitive voter fields
- Improve audit logging for every verification and voting action
- Add stronger liveness detection for face verification
- Add direct API/serial integration between the ESP32 fingerprint module and the Flask backend
- Store fingerprint template IDs in a dedicated biometric mapping collection
- Add scalable deployment configuration using Docker
- Add automated tests for backend routes and frontend workflows
- Improve anomaly detection with trained models and historical booth-level data

## Project Status

TrueBallot is a working academic prototype that demonstrates a complete voter authentication workflow using a React frontend, Flask API backend, MongoDB database, ESP32 fingerprint biometric verification, Twilio OTP service, face verification, booth allocation, and election monitoring dashboards.
