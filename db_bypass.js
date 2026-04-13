const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zaqkctlrvebulnbvirzl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo');
async function bypass() {
    const { error } = await supabase.from('profiles').update({ status: 'PERMANENT', is_admin: true }).eq('id', '9fb204bc-8e73-40ab-b800-fb86928bf608');
    if (error) console.log('? DB ERROR:', error.message);
    else console.log('? SOVEREIGNTY RESTORED: Marvin is now PERMANENT.');
}
bypass();
