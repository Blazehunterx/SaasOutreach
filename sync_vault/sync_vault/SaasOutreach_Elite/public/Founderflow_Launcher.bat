@echo off
title FOUNDERFLOW ELITE: COMMAND BRIDGE v4.0
color 0B

echo ==========================================================
echo        FOUNDERFLOW ELITE: ABSOLUTE SETUP v4.0
echo ==========================================================
echo [SYSTEM] Initializing Local Outreach Node...

:: 1. Check for Node Modules
if not exist "node_modules" (
    echo [SETUP] First-time setup detected. Linking Security Hardware...
    npm install @supabase/supabase-js node-machine-id playwright
)

:: 2. Initialize Handshake Pulse
echo [CONNECT] Establishing Cloud Nexus Handshake...
node secure_connector_v1.js

pause
