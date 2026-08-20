@echo off
echo Stopping Lincoln International Hospital HPBS servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo All servers stopped.
pause
