const { createClient } = require('@supabase/supabase-js');

// 🛡️ Founderflow Elite: Matrix Initializer (v8.1.3)
// [PROTOCOL: FORCE-CREATING TEST ENVIRONMENT]

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjgyNTYsImV4cCI6MjA4ODM0NDI1Nn0.JGr_oJdidTTtmPbMLyx8z3RmLgT8rJuPm1AAHmASx_A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TEST_ID = '930c7764-585e-40fa-8c90-272e616c68b7';

async function initMatrix() {
    console.log(`🚀 INITIALIZING SOVEREIGN TEST MATRIX...`);
    
    // 1. Create Profile
    await supabase.from('profiles').upsert({ id: TEST_ID, email: 'test@founderflow.ai' });
    
    // 2. Create Initial Settings
    await supabase.from('campaign_settings').upsert({
        user_id: TEST_ID,
        delay_seconds: 300,
        daily_limit: 50,
        target_industry: 'Initial Audit'
    });

    console.log(`✅ MATRIX INITIALIZED. RE-RUNNING SYNC TEST...`);
}

initMatrix();
