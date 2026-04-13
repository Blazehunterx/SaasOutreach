import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

const LOG_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/factory_heartbeat.log';
const DISCOVERY_SCRIPT = 'c:/Users/marvi/OneDrive/Documenten/Playground/hybrid_discovery_v173.js';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function logHeartbeat(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] 🛡️ Nexus Heartbeat: ${message}\n`);
    console.log(`[${timestamp}] 🧬 ${message}`);
}

async function runCycle() {
    logHeartbeat("Launching Daily Dual-Track Discovery Cycle...");
    
    exec(`node ${DISCOVERY_SCRIPT}`, (error, stdout, stderr) => {
        if (error) {
            logHeartbeat(`❌ Cycle Fault: ${error.message}`);
            return;
        }
        if (stderr) {
            logHeartbeat(`⚠️ Cycle Warning: ${stderr}`);
        }
        logHeartbeat("✅ Daily Alpha-Batch Unmasked & Synchronized.");
        console.log(stdout);
    });
}

function startPerpetualEngine() {
    logHeartbeat("INITIALIZING PERPETUAL NEXUS v1.76 (Total Autonomy Mode)");
    
    // 🚀 First Strike Immediately
    runCycle();

    // 🧬 Perpetual Loop
    setInterval(() => {
        runCycle();
    }, TWENTY_FOUR_HOURS);
}

startPerpetualEngine();
