@echo off
setlocal
cd /d "%~dp0"
title Portfolio - oeffentlich ueber ngrok

set PORT=8089

where python >nul 2>&1
if errorlevel 1 goto keinpython

where ngrok >nul 2>&1
if errorlevel 1 goto keinngrok

echo.
echo   Portfolio wird ueber ngrok geteilt ...
echo   Ausgeliefert wird nur die Website selbst - keine Notizen, Skripte oder .git.
echo.

python scripts\ngrok-teilen.py %PORT%
if errorlevel 1 goto fehler
exit /b 0

:keinngrok
echo.
echo   ngrok ist nicht installiert.
echo.
echo   Einrichtung, einmalig:
echo     1. winget install Ngrok.Ngrok
echo     2. Kostenlos anmelden auf dashboard.ngrok.com, Authtoken kopieren
echo     3. ngrok config add-authtoken DEIN_TOKEN
echo     4. Neues Fenster, diese Datei nochmal starten
echo.
choice /c JN /m "  Schritt 1 jetzt ausfuehren"
if errorlevel 2 goto ende
winget install Ngrok.Ngrok
echo.
echo   Fertig. Jetzt Schritt 2 und 3, dann diese Datei in einem NEUEN Fenster starten,
echo   damit der neue PATH greift.
echo.
pause
exit /b 0

:keinpython
echo.
echo   FEHLER: python nicht gefunden.
echo   Python installieren oder zum PATH hinzufuegen.
echo.
pause
exit /b 1

:fehler
echo.
pause
exit /b 1

:ende
exit /b 0
