@echo off
setlocal

echo Opening MongoDB, backend and frontend in separate windows...
start "Voter Auth MongoDB" cmd /k "%~dp0start-mongodb.bat"
start "Voter Auth Backend" cmd /k "%~dp0start-backend.bat"
start "Voter Auth Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo MongoDB:  mongodb://127.0.0.1:27017/voter_auth_db
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:3000
echo.
echo Keep all terminal windows open while using the app.

endlocal
