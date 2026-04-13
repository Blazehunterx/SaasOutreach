const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 🛡️ Founderflow Elite: Fusion Harvester v10.5
// [PROTOCOL: SURGICAL DORKING + SUPABASE SYNC]

const SUPABASE_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USER_ID = '9fb204bc-8e73-40ab-b800-fb86928bf608'; // Your Sovereign ID

async function runFusionHarvest() {
    console.log(`\n==========================================================`);
    console.log(`       FOUNDERFLOW ELITE: FUSION HARVESTER v10.5`);
    console.log(`==========================================================`);

    const { data: config } = await supabase.from('campaign_settings').select('*').eq('user_id', USER_ID).single();
    const industry = config?.target_industry || 'AI Automation Agency';
    const context = config?.target_context || 'Founder';

    const DORK_QUERIES = [
        `site:linkedin.com/in "${context}" "${industry}"`,
        `site:linkedin.com/in "CEO" "${industry}" "Automation"`,
        `site:linkedin.com/in "${context}" "${industry}" "Lead Generation Agency"`
    ];

    console.log(`🚀 ACTIVATING SURGICAL SENSORS: [${industry}]`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let totalFound = 0;

    try {
        for (const query of DORK_QUERIES) {
            console.log(`🔎 Pushing Dork: ${query}`);
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(4000);

            const leads = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('div.g').forEach(res => {
                    const title = res.querySelector('h3')?.innerText;
                    let url = res.querySelector('a')?.href;
                    
                    // 🏁 v1.58: Redirect Unmasking
                    if (url && url.includes('google.com/url?q=')) {
                        const parts = new URL(url);
                        url = parts.searchParams.get('q')?.split('&')[0];
                    }

                    const bio = res.querySelector('div[style*="webkit-line-clamp"]')?.innerText || "";
                    if (url?.includes('linkedin.com/in/')) {
                        results.push({ name: title?.split(' - ')[0], url, bio });
                    }
                });
                return results;
            });

            console.log(`🏊 [SYNCING] ${leads.length} leads found. Inbound to Vault...`);

            for (const lead of leads) {
                const { error } = await supabase.from('leads').upsert({
                    user_id: USER_ID,
                    full_name: lead.name,
                    linkedin_url: lead.url,
                    company: lead.bio,
                    platform: 'linkedin',
                    status: 'found',
                    discovered_at: new Date().toISOString()
                }, { onConflict: 'profile_url' });
                
                if (!error) totalFound++;
            }
        }
    } catch (e) {
        console.log(`❌ SENSOR ERROR: ${e.message}`);
    } finally {
        await browser.close();
        console.log(`\n✅ HARVEST COMPLETE: ${totalFound} new founders injected into SaaS Hub.`);
        process.exit(0);
    }
}

runFusionHarvest();
