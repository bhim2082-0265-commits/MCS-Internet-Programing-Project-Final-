@echo off
echo Starting Lincoln International Hospital HPBS...

:: Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Backend in hidden window
echo Starting Backend Server...
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location 'C:\Users\Dell\MCS-Internet-Programing-Project-Final-\backend'; npm run dev > 'C:\Users\Dell\MCS-Internet-Programing-Project-Final-\backend.log' 2>&1"

:: Wait for backend
timeout /t 5 /nobreak >nul

:: Start Frontend in hidden window
echo Starting Frontend Server...
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location 'C:\Users\Dell\MCS-Internet-Programing-Project-Final-\frontend'; npm run dev > 'C:\Users\Dell\MCS-Internet-Programing-Project-Final-\frontend.log' 2>&1"

:: Wait for frontend
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo  Lincoln International Hospital HPBS
echo  Frontend: http://lincolnhospital:8080
echo  Backend:  http://localhost:5000
echo ========================================
echo.
echo Both servers are running in background.
echo Close this window - servers will keep running.
pause
