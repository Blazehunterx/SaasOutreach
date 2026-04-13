const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zaqkctlrvebulnbvirzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo');
async function check() {
    const { data, error } = await supabase.from('profiles').select('status, is_admin').eq('id', '9fb204bc-8e73-40ab-b800-fb86928bf608').single();
    if (error) console.log('? DB ERROR:', error.message);
    else console.log('? STATUS AUDIT:', data);
}
check();
