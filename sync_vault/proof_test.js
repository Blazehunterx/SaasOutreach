const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const liDriver = require('./drivers/linkedin'); 
const igDriver = require('./drivers/ig');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const USER_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608';
const PLATFORMS = { instagram: 'https://www.instagram.com' };

async function testPop() {
    console.log('[PROOFS] Triggering Physical Instagram Pop...');
    const browser = await chromium.launch({ 
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-session-crashed-bubble',
            '--disable-features=RestoreByTab'
        ]
    });
    const page = await browser.newPage();
    await page.goto(PLATFORMS.instagram, { waitUntil: 'domcontentloaded' });
    console.log('[SUCCESS] Instagram is open. Capture state active.');
    await new Promise(r => setTimeout(r, 10000)); // Stay open for 10s for the capture
    await browser.close();
}
testPop();