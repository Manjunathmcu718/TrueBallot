# AI Voter Authentication System

## 1. Project Overview

This project is an AI-based Voter Authentication System. Its purpose is to verify a voter before allowing vote recording. It combines identity checks, face verification, OTP verification, admin management, booth mapping, and dashboard analytics.

The project has three main parts:

- Frontend built with React
- Backend built with Flask
- Database built on MongoDB

## 2. Main Goal of the Project

The system is designed to:

- verify voter identity
- validate government IDs
- compare live face with stored voter photo
- send OTP to the voter
- record whether the voter has voted
- help admin manage voters and booths
- show dashboard statistics and possible fraud patterns

## 3. Overall Architecture

### Frontend

The frontend is in the `frontend` folder. It provides the user interface for:

- voter authentication
- admin panel
- election dashboard
- booth allocation

### Backend

The backend is in the `backend` folder. It handles:

- API routes
- database operations
- image validation
- face verification
- OTP generation
- SMS sending
- anomaly detection

### Database

MongoDB stores all project data such as:

- voters
- booths
- anomalies
- locality-to-booth mappings
- voter photos using GridFS

## 4. Frontend Technologies and Libraries

Frontend dependencies are listed in `frontend/package.json`.

### React

Used to build the UI.

### React Router DOM

Used for page navigation between:

- Voter Login
- Dashboard
- Admin
- Booth Allocation

### Axios

Used for sending HTTP requests to the backend APIs.

### Framer Motion

Used for page and component animations.

### Lucide React

Used for icons across the UI.

### Tailwind CSS

Used for styling and layout design.

## 5. Backend Technologies and Libraries

Backend dependencies are listed in `backend/requirements.txt`.

### Flask

Main backend framework.

### Flask-CORS

Allows frontend and backend to communicate from different ports.

### Flask-PyMongo

Connects Flask with MongoDB.

### python-dotenv

Loads environment variables such as MongoDB and Twilio credentials.

### Twilio

Used for OTP and confirmation SMS.

### Pillow

Used for image processing.

### OpenCV

Used for image validation and anti-spoofing checks.

### DeepFace

Used for face verification between stored and live voter images.

### NumPy

Used in image processing calculations.

### Requests

Used when image data needs to be fetched from a URL.

### Pandas and Scikit-learn

Present in requirements, but not strongly used in the main active flow right now.

## 6. Important Backend Files

### `backend/app.py`

This is the main backend entry point.

It:

- creates the Flask app
- loads environment variables
- connects MongoDB
- enables CORS
- registers route blueprints

Blueprints registered:

- auth routes
- admin routes
- data routes
- government verification routes
- image routes
- booth allocation routes
- anomaly routes

### `backend/routes/auth_routes.py`

This file handles voter authentication.

Main endpoints:

- `/api/auth/authenticate`
- `/api/auth/verify-otp`
- `/api/auth/vote`
- `/api/auth/compare-faces`

Responsibilities:

- match voter credentials from DB
- check age eligibility
- verify face using stored image and live image
- create OTP
- verify OTP
- record vote
- send SMS

### `backend/routes/admin_routes.py`

This file handles admin operations.

Main features:

- add voter
- list voters
- delete voter
- add booth
- list booths
- upload and fetch voter image

It also validates:

- voter ID format
- Aadhaar format
- phone number format
- duplicate voter records

### `backend/routes/data_routes.py`

This file provides dashboard and data APIs.

It returns:

- total voters
- voted count
- not voted count
- recent votes
- anomaly list

It also has anomaly detection logic based on turnout.

### `backend/routes/gov_verify_routes.py`

This file simulates government verification.

It pretends to verify:

- Aadhaar through UIDAI
- voter ID through Election Commission

This is demo logic, not real government API integration.

### `backend/routes/booth_allocation.py`

This file handles locality-to-booth mapping.

Features:

- create booth mapping manually
- get mappings
- delete mapping
- auto-allocate booth from address
- bulk analyze addresses
- auto-generate mappings from voter data

### `backend/routes/anomaly_routes.py`

This file handles advanced anomaly detection.

It checks for:

- high turnout
- low turnout
- duplicate Aadhaar
- shared phone numbers
- location mismatch
- vote spike

## 7. Important Utility Files

### `backend/utils/validation.py`

Contains helper functions for:

- Aadhaar validation
- voter ID validation
- Indian phone validation
- age calculation

### `backend/utils/sms.py`

Handles SMS sending using Twilio.

If Twilio is not configured, it prints a simulated SMS in the console.

### `backend/utils/image_validator.py`

Validates uploaded voter images.

Checks include:

- file size
- image format
- image dimensions
- orientation
- blur
- face detection
- single-face requirement

## 8. Face Verification Service

### `backend/services/advanced_face_verification.py`

This is the AI module of the project.

It performs:

- anti-spoof detection
- face comparison using DeepFace
- confidence scoring
- final match decision

The stored voter photo is compared against the live webcam image.

## 9. Frontend Main Pages

### `frontend/src/App.js`

Main router file.

Routes:

- `/` for voter authentication
- `/dashboard` for dashboard
- `/admin` for admin panel
- `/booth-allocation` for booth allocation

### `frontend/src/pages/VoterAuth.js`

This is the main voter-side workflow page.

It controls these steps:

1. voter enters details
2. government verification runs
3. face verification runs
4. backend authenticates voter
5. OTP is verified
6. vote status is shown
7. vote is recorded

### `frontend/src/pages/Admin.js`

This is the admin page.

Admin can:

- add voters
- upload voter photos
- delete voters
- add booths
- search voter data

### `frontend/src/pages/Dashboard.js`

Shows election statistics like:

- total registered voters
- number of votes cast
- number of voters remaining
- turnout percentage
- recent votes
- anomalies

### `frontend/src/pages/BoothAllocation.js`

Used for booth mapping management.

Admin can:

- manually create booth mappings
- auto-generate booth mappings from voter addresses
- view and delete mappings

## 10. Frontend Components

### Voter Components

- `AuthForm.js`
  - takes voter ID, Aadhaar, and phone number
- `GovernmentVerification.js`
  - calls backend for ID verification
- `FaceVerification.js`
  - opens webcam and captures live face image
- `OTPVerification.js`
  - takes OTP input
- `VotingStatus.js`
  - shows voter status and allows vote recording

### Admin Components

- `AddVoterForm.js`
  - form to add a voter with address, booth, and photo
- `AddBoothForm.js`
  - form to create polling booth
- `VoterTable.js`
  - shows all voter records in table format
- `DeleteConfirmDialog.js`
  - delete confirmation popup

## 11. Database Collections

Main collections used:

- `voters`
- `booths`
- `anomalies`
- `locality_booth_mapping`

Voter images are stored using GridFS.

Typical voter record includes:

- voter ID
- Aadhaar number
- phone number
- full name
- date of birth
- age
- address
- constituency
- polling station
- has voted status
- voting timestamp
- OTP code
- OTP expiry
- image ID

## 12. Complete Voter Workflow

### Step 1: Enter credentials

The voter enters:

- voter ID
- Aadhaar number
- phone number

### Step 2: Government verification

The system simulates verification with:

- UIDAI for Aadhaar
- Election Commission for voter ID

### Step 3: Face verification

The voter captures a live webcam photo.

Backend compares:

- stored voter image
- live captured image

### Step 4: OTP generation

If face verification passes, backend:

- generates OTP
- stores OTP in MongoDB
- sends SMS using Twilio or console simulation

### Step 5: OTP verification

The voter enters the OTP.

Backend checks:

- whether OTP matches
- whether OTP expired

### Step 6: Vote recording

If OTP is correct, the voter can record a vote.

Backend updates:

- `has_voted = True`
- `voting_timestamp`

Then a confirmation SMS is sent.

## 13. Complete Admin Workflow

### Add voter

Admin enters voter details and uploads photo.

Backend:

- validates fields
- checks duplicates
- validates photo
- stores image in GridFS
- stores voter record in MongoDB

### Delete voter

Admin can delete voter record and associated image.

### Add booth

Admin creates booth records for polling stations.

### Smart booth allocation

Admin can auto-fill booth assignment based on locality found in address.

## 14. Dashboard Workflow

Dashboard fetches data from backend and displays:

- total voters
- total voted
- turnout percentage
- recent votes
- anomaly results

It can also run AI-style anomaly detection.

## 15. Booth Allocation Workflow

This module maps localities to polling booths.

It supports:

- manual mapping
- automatic booth assignment
- auto-generation of mappings from voter addresses

This helps reduce manual booth assignment work.

## 16. Seed Script

### `backend/seed_database.py`

This script fills MongoDB with fake voter data for testing.

It:

- creates fake voters
- assigns random constituencies and booths
- marks some voters as already voted

This is useful for demo and dashboard testing.

Note: this script uses `Faker`, which is not currently listed in `backend/requirements.txt`.

## 17. Strengths of the Project

- good full-stack architecture
- clear separation of frontend and backend
- strong demo features
- includes AI/face verification concept
- includes admin tools
- includes booth allocation
- includes dashboard analytics

## 18. Current Nature of the Project

This looks like a student/demo project that is still evolving.

Reasons:

- some older commented code still exists
- some routes overlap in responsibility
- some response formats are slightly inconsistent between frontend and backend

Still, the overall idea and implementation are strong and useful for presentation, demo, or minor project explanation.

## 19. Final Summary

This project is a smart digital voter authentication platform built using React, Flask, and MongoDB. It verifies a voter through credential matching, simulated government ID checks, face verification, and OTP verification. It also provides admin management, booth mapping, dashboard analytics, and anomaly detection in one integrated system.
