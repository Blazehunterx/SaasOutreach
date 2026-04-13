const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

const MASTER_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/titanium_master_list.json';
const LOG_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/factory_heartbeat.log';
const SHOT_DIR = 'c:/Users/marvi/OneDrive/Documenten/Playground/factory_shots';

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const CITIES = ['New York', 'London', 'Dubai', 'Amsterdam', 'Sydney', 'Singapore', 'Miami', 'Berlin'];
const INDUSTRIES = ['SaaS Founder', 'AI Agency', 'E-commerce Owner', 'Solar Company', 'Real Estate CEO', 'Law Firm Partner', 'Logistics Owner', 'Medical Center CEO'];

async function harvestBatch(context, query, iteration) {
    const page = await context.newPage();
    try {
        console.log(`🔍 Sentinel: Deep-Scanning for [${query}]...`);
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(7000); 
        
        if (iteration % 5 === 0) {
            const shotPath = path.join(SHOT_DIR, `shot_${iteration}.png`);
            await page.screenshot({ path: shotPath });
            console.log(`📸 Sentinel: Forensic Shot Saved: ${shotPath}`);
        }

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => ({ href: a.href, text: a.innerText }))
                .filter(l => l.href && (l.href.includes('linkedin.com') || l.href.includes('instagram.com')))
                .filter(l => !l.href.includes('/reels/') && !l.href.includes('/p/') && !l.href.includes('/explore/'));
        });
        
        console.log(`📊 Sentinel: Raw hits found: ${links.length}`);
        
        await page.close();
        return links.map(l => ({ 
            url: l.href, 
            platform: l.href.includes('linkedin') ? 'linkedin' : 'ig',
            timestamp: new Date().toISOString(),
            query: query
        }));
    } catch (e) {
        console.error(`❌ Sweep Fault: ${e.message}`);
        if (!page.isClosed()) await page.close();
        return [];
    }
}

async function runDaemon() {
    console.log("🚀 Sentinel: 24-Hour Lead Factory Daemon STARTED (Forensic Mode).");
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] DAEMON RELAUNCH - FORENSIC MODE\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });

    let totalNew = 0;
    let iteration = 0;
    
    for (const industry of INDUSTRIES) {
        for (const city of CITIES) {
            const queries = [
                `site:linkedin.com/in "${city}" "${industry}"`,
                `site:instagram.com "${city}" "${industry}"`
            ];

            for (const q of queries) {
                iteration++;
                const results = await harvestBatch(context, q, iteration);
                
                let existing = [];
                if (fs.existsSync(MASTER_FILE)) {
                    try { existing = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8')); } catch (e) {}
                }
                const seen = new Set(existing.map(l => l.url.toLowerCase().trim()));

                const fresh = results.filter(l => !seen.has(l.url.toLowerCase().trim()));
                const updated = [...existing, ...fresh];
                
                fs.writeFileSync(MASTER_FILE, JSON.stringify(updated, null, 2));
                totalNew += fresh.length;
                
                fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] Query: ${q} | Fresh: ${fresh.length} | Master Size: ${updated.length} | Iteration: ${iteration}\n`);
                console.log(`✅ Sentinel: +${fresh.length} leads. Master Size: ${updated.length}`);
                
                await new Promise(r => setTimeout(r, 60000)); 
            }
        }
    }

    await browser.close();
    console.log("🏆 Sentinel: 24-Hour Cycle Complete.");
}

runDaemon();
