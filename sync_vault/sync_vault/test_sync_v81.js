const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 🛡️ Founderflow Elite: Offset & Matrix Verification (v8.1)
// [PROTOCOL: VERIFYING CLOUD-TO-LOCAL SYNC]

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjgyNTYsImV4cCI6MjA4ODM0NDI1Nn0.JGr_oJdidTTtmPbMLyx8z3RmLgT8rJuPm1AAHmASx_A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TEST_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608';

async function verifySync() {
    console.log(`\n==========================================================`);
    console.log(`       FOUNDERFLOW ELITE: SYNC VERIFICATION v8.1`);
    console.log(`==========================================================`);

    console.log(`🚀 STEP 1: Updating Cloud Matrix (Delay: 450s, Niche: "High-Ticket Ecom")...`);
    
    await supabase.from('campaign_settings').upsert({
        user_id: TEST_ID,
        delay_seconds: 450,
        daily_limit: 75,
        target_industry: 'High-Ticket Ecom',
        target_context: 'Rebranding Intent',
        bio_keywords: 'Founder, CEO, D2C'
    });

    console.log(`⏳ STEP 2: Waiting for Local Connector to Sync...`);
    await new Promise(r => setTimeout(r, 5000)); // Give time for sync interval

    if (fs.existsSync('bridge_config.json')) {
        const localConfig = JSON.parse(fs.readFileSync('bridge_config.json', 'utf8'));
        if (localConfig.delay_seconds === 450 && localConfig.industry === 'High-Ticket Ecom') {
            console.log(`✅ SUCCESS: Local Engine synchronized with Cloud Matrix.`);
            console.log(`📊 DELAY: ${localConfig.delay_seconds}s`);
            console.log(`📊 NICHE: ${localConfig.industry}`);
        } else {
            console.log(`❌ FAILURE: Local config mismatch. Found Delay: ${localConfig.delay_seconds}s`);
        }
    } else {
        console.log(`❌ FAILURE: bridge_config.json not found.`);
    }
}

verifySync();
