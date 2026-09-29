@echo off
echo Starting LibroTrack...
echo Make sure MySQL is running and application.properties has the correct password.
call mvn clean spring-boot:run
pause
