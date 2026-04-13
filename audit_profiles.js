const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjgyNTYsImV4cCI6MjA4ODM0NDI1Nn0.JGr_oJdidTTtmPbMLyx8z3RmLgT8rJuPm1AAHmASx_A';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findMarvin() {
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5);
    console.log(JSON.stringify(profiles, null, 2));
}
findMarvin();
