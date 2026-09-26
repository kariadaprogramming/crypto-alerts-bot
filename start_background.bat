@echo off
echo Starting Crypto Alerts Bot in background...
echo The bot will continue running even if you close this window.
echo.
echo Press Ctrl+C to stop the bot, or just close this window.
echo.
echo To stop the bot later, you can:
echo 1. Find the node.exe process in Task Manager and end it
echo 2. Or run: taskkill /F /IM node.exe
echo.

REM Use start command to run in background
start /B node index.js

echo ✅ Bot started in background!
echo Check the process in Task Manager if needed.
