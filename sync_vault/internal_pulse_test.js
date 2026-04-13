const { createClient } = require('@supabase/supabase-js');

// 🛡️ Founderflow Elite: Sovereign Pulse Injection (v7.3.2)
// [PROTOCOL: BYPASSING EVERY CONSTRAINT]

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjgyNTYsImV4cCI6MjA4ODM0NDI1Nn0.JGr_oJdidTTtmPbMLyx8z3RmLgT8rJuPm1AAHmASx_A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TEST_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608';

async function sovereignInjection() {
    console.log(`🚀 INITIALIZING SOVEREIGN INJECTION...`);
    
    // 1. Create Dummy Profile to Satisfy FK
    await supabase.from('profiles').upsert({ id: TEST_ID, email: 'test@founderflow.ai' });
    
    // 2. Trigger Pulse
    const { error } = await supabase.from('campaign_settings').upsert({
        user_id: TEST_ID,
        target_platform: 'linkedin',
        connection_pulse_at: new Date().toISOString()
    });

    if (error) console.log(`❌ SOVEREIGN FAULT: ${error.message}`);
    else console.log(`✅ SOVEREIGN SUCCESS. BROWSER LAUNCHING...`);
}

sovereignInjection();
