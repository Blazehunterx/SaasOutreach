const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const liDriver = require('./drivers/linkedin'); 
const igDriver = require('./drivers/ig');
const gmailDriver = require('./drivers/gmail');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const USER_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608';
const PLATFORMS = {
    linkedin: 'https://www.linkedin.com',
    instagram: 'https://www.instagram.com',
    gmail: 'https://mail.google.com/mail/u/0/#inbox'
};

async function runFusionOutreach() {
    console.log('\n==========================================================');
    console.log('       FOUNDERFLOW ELITE: FUSION OUTREACH v13.1');
    console.log('==========================================================');

    const { data: settings } = await supabase.from('campaign_settings').select('*').eq('user_id', USER_ID).single();
    const profileDir = path.resolve('sessions', 'profiles', settings.target_platform);
    if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

    console.log('[HANDSHAKE] Launching Physical ' + settings.target_platform.toUpperCase() + ' Window...');
    const browser = await chromium.launchPersistentContext(profileDir, { 
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-session-crashed-bubble',
            '--disable-features=RestoreByTab',
            '--restore-last-session=false'
        ]
    });

    const page = await browser.newPage();
    const targetUrl = PLATFORMS[settings.target_platform] || 'https://www.google.com';
    console.log('[HANDSHAKE] Navigating to destination: ' + targetUrl + '...');
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    console.log('\n[WAIT] 🛡️ SILENT HANDSHAKE ACTIVE. (120s)');
    console.log('[INFO] Please log in manually. No outreach will start until the handshake is complete.');
    await page.waitForTimeout(120000); 

    const { data: rawLeads } = await supabase.from('leads').select('*').eq('user_id', USER_ID).eq('status', 'found');
    const leads = (rawLeads || []).filter(l => {
        const url = (l.linkedin_url || '').toLowerCase();
        if (settings.target_platform === 'instagram') return url.includes('instagram.com');
        return url.includes('linkedin.com/in/');
    }).slice(0, settings.daily_limit || 10);

    if (!leads || leads.length === 0) {
        console.log('[SUCCESS] No siloed leads for ' + settings.target_platform.toUpperCase() + '. Handover complete.');
        return;
    }
}
runFusionOutreach();
