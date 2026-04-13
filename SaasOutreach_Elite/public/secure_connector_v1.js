import { machineIdSync } from 'node-machine-id';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { exec } from 'child_process';

// 🛡️ Founderflow Secure Connector v1.82
const CONFIG = {
    URL: 'YOUR_SUPABASE_URL',
    KEY: 'YOUR_SUPABASE_ANON_KEY',
    ENGINE: 'founderflow.js'
};

const supabase = createClient(CONFIG.URL, CONFIG.KEY);

async function validateAccess() {
    console.log("🛡️ Founderflow Secure Connector v1.82");
    console.log("🔒 Initializing Physical Hardware Bridge...");

    const id = machineIdSync();
    console.log(`🆔 Machine Signature: ${id}`);

    // Check Supabase for this Machine ID and User Status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error("❌ ERROR: Connection Refused. Please login at the Hub first.");
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        console.error("❌ ERROR: Identity Not Found. Please finalize onboarding.");
        return;
    }

    if (profile.status !== 'APPROVED') {
        console.error(`⚠️ IDENTITY STATUS: ${profile.status}. Outreach Locked.`);
        console.log("ℹ️ Please wait for Admin approval in the Elite Hub.");
        return;
    }

    // Capture Machine ID on first run to lock the trial to this computer
    if (!profile.machine_id) {
        await supabase.from('profiles').update({ machine_id: id }).eq('id', user.id);
        console.log("✅ Device Locked successfully.");
    } else if (profile.machine_id !== id) {
        console.error("❌ ERROR: Unauthorized Device. This license is locked to another machine.");
        return;
    }

    console.log("💎 ACCESS GRANTED: Launching Outreach Engine...");
    
    // Launch the core engine
    const engine = exec(`node ${CONFIG.ENGINE}`);
    engine.stdout.on('data', data => console.log(data));
    engine.stderr.on('data', data => console.error(data));
}

validateAccess();
