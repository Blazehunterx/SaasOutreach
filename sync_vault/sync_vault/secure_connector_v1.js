const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🛡️ Founderflow Elite: Jesus-Proof Orchestrator v10.8
// [PROTOCOL: SERVICE-LEVEL SOVEREIGN BRIDGE]

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
// 🏁 v1.29 TITANIUM KEY: Absolute Service Role Empowerment
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const USER_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608'; // Your Sovereign ID

function logPulse(msg) {
    console.log(`\n[${new Date().toLocaleTimeString()}] ⚡️ PULSE: ${msg}`);
}

async function initializeSettings() {
    console.log(`📡 [AUTO-INIT] Checking Sovereign Configuration...`);
    const { data, error } = await supabase.from('campaign_settings').select('*').eq('user_id', USER_ID).single();
    
    if (!data) {
        console.log(`⚠️ [HANDSHAKE] No settings found. Initializing Production Defaults...`);
        const { error: insErr } = await supabase.from('campaign_settings').upsert({
            user_id: USER_ID,
            template: "Hey {name}, saw your {company} and loved the approach...",
            delay_seconds: 300,
            daily_limit: 50,
            target_platform: 'linkedin',
            updated_at: new Date().toISOString()
        });
        if (!insErr) console.log(`✅ [SUCCESS] Default Configuration Propagated.`);
    } else {
        console.log(`✅ [SURETY] Sovereign Configuration Verified.`);
    }
}

async function startBridge() {
    console.log(`\n==========================================================`);
    console.log(`       FOUNDERFLOW ELITE: COMMAND BRIDGE v10.9`);
    console.log(`==========================================================`);

    console.log(`📡 [HANDSHAKE] Empowering Hardware via Service Nexus...`);
    
    await initializeSettings();

    // Test connection
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', USER_ID).single();
    if (error) {
        console.log(`[ERROR] Vault Rejected Hardware: ${error.message}`);
        process.exit(1);
    }

    await supabase.from('profiles').update({ handshake_established: true, last_handshake_at: new Date().toISOString() }).eq('id', USER_ID);

    console.log(`\n[SUCCESS] Nexus Established: ${profile.full_name}`);
    console.log(`[MONITOR] Listening for Dashboard Commands (Absolute Mode)...`);

    let lastConnectionPulse = null;
    let lastHarvestPulse = null;

    setInterval(async () => {
        const { data: config } = await supabase.from('campaign_settings').select('*').eq('user_id', USER_ID).single();
        if (!config) return;

        // Sync config locally for individual fusion engines
        fs.writeFileSync('bridge_config.json', JSON.stringify(config, null, 2));

        // 🎯 1. Outreach Pulse (Make Connection)
        if (config.connection_pulse_at !== lastConnectionPulse && lastConnectionPulse !== null) {
            logPulse(`Triggering Fusion Outreach for ${config.target_platform.toUpperCase()}...`);
            exec('node fusion_outreach.js', (err, stdout, stderr) => {
                if (err) console.log(`[FAULT] Outreach: ${err.message}`);
                console.log(stdout);
            });
        }
        lastConnectionPulse = config.connection_pulse_at;

        // 🎯 2. Harvest Pulse (Initialize Global Harvest)
        if (config.harvest_pulse_at !== lastHarvestPulse && lastHarvestPulse !== null) {
            logPulse(`Triggering Surgical Discovery [${config.target_industry}]...`);
            exec('node fusion_harvester.js', (err, stdout, stderr) => {
                if (err) console.log(`[FAULT] Harvest: ${err.message}`);
                console.log(stdout);
            });
        }
        lastHarvestPulse = config.harvest_pulse_at;

    }, 3000); 
}

startBridge();
