const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

const LEADS_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/leads.json';
const SENT_FILE = 'c:/Users/marvi/.gemini/antigravity/brain/2cc93c7c-4600-b46e-f4f813c7fcc2/sent_leads.json';

const NICHES = [
    { name: 'SaaS/AI Founder', query: 'site:linkedin.com/in "Founder" "AI Agency"' }
];

async function harvest(context, niche) {
    const page = await context.newPage();
    try {
        console.log(`🔍 Sentinel: Deep-Scanning for [${niche.name}]...`);
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(niche.query)}&t=h_&ia=web`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(8000); // 🏁 EXTENDED HYDRATION DELAY
        
        // FORENSIC SHOT
        const shotPath = `c:/Users/marvi/OneDrive/Documenten/Playground/search_debug.png`;
        await page.screenshot({ path: shotPath });
        console.log(`📸 Sentinel: Forensic Screenshot Saved: ${shotPath}`);

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(u => u.includes('linkedin.com/in/') || u.includes('instagram.com/'))
                .filter(u => !u.includes('/reels/') && !u.includes('/p/') && !u.includes('/explore/'));
        });
        
        await page.close();
        return [...new Set(links)].map(u => ({ url: u, platform: u.includes('linkedin') ? 'linkedin' : 'ig' }));
    } catch (e) {
        console.error(`❌ Sweep Failed [${niche.name}]: ${e.message}`);
        if (!page.isClosed()) await page.close();
        return [];
    }
}

async function main() {
    console.log("🚀 Launching Universal Lead Factory v1.59 [FORENSIC_MODE]...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    
    for (const niche of NICHES) {
        const results = await harvest(context, niche);
        console.log(`✅ Niche [${niche.name}]: Captured ${results.length} leads.`);
    }

    await browser.close();
}

main();
