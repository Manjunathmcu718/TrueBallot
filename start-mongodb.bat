@echo off
setlocal

set "MONGOD=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
set "DBPATH=%~dp0mongo-data-real"
set "LOGPATH=%~dp0backend\mongod.projectdata.log"

if not exist "%MONGOD%" (
    echo MongoDB executable not found:
    echo %MONGOD%
    exit /b 1
)

if not exist "%DBPATH%" (
    echo MongoDB data folder not found:
    echo %DBPATH%
    exit /b 1
)

echo Starting MongoDB on mongodb://127.0.0.1:27017
echo Data: %DBPATH%
"%MONGOD%" --dbpath "%DBPATH%" --bind_ip 127.0.0.1 --port 27017 --setParameter diagnosticDataCollectionEnabled=false --logpath "%LOGPATH%" --logappend

endlocal
