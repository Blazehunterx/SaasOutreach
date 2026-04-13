import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

chromium.use(StealthPlugin());

const DATABASE_PATH = './local_market_opportunities.json';

function log(msg) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${msg}`);
}

async function harvest() {
    log("🚀 Launching Local Master Harvest...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    const leads = [];

    try {
        // 1. Skool Harvest
        const categories = ['business', 'ai-automation', 'marketing'];
        for (const cat of categories) {
            log(`🔎 Scraping Skool: ${cat.toUpperCase()}`);
            await page.goto(`https://www.skool.com/discovery?c=${cat}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(5000);
            
            const skoolLeads = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .filter(a => a.href.includes('skool.com/') && a.innerText.toLowerCase().includes('members'))
                    .map(a => {
                        const m = a.innerText.match(/([\d.,]+)\s*members/i);
                        return { name: a.innerText.split('\n')[0], url: a.href, members: m ? parseInt(m[1].replace(/[,.]/g, '')) : 0, source: 'Skool' };
                    });
            });
            leads.push(...skoolLeads.filter(l => l.members >= 300));
        }

        // 2. Bing Dorking (X and LinkedIn)
        const queries = [
            'site:twitter.com "Founder" "Agency"',
            'site:linkedin.com/in "CEO" "AI Agency"'
        ];
        for (const q of queries) {
            log(`🔎 Bing Dorking: ${q}`);
            await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(5000);
            
            const dorkLeads = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('li.b_algo h2 a'))
                    .map(a => ({ name: a.innerText, url: a.href, source: 'Bing' }));
            });
            leads.push(...dorkLeads.filter(l => l.url.includes('twitter.com') || l.url.includes('linkedin.com/in/')));
        }

        log(`✅ Harvest Complete! Found ${leads.length} unique opportunities.`);
        fs.writeFileSync(DATABASE_PATH, JSON.stringify(leads, null, 4));
        
    } catch (e) {
        log(`❌ ERROR during harvest: ${e.message}`);
    } finally {
        await browser.close();
    }
}

harvest();
