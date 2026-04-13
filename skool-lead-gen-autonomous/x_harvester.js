import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { log, saveJson, loadJson, paths, updateHeartbeat } from './utils.js';

chromium.use(StealthPlugin());

const QUERIES = [
    '(Founder OR CEO) "AAA"',
    '(Founder OR CEO) "AI Automation Agency"',
    '(Founder OR CEO) "Lead Gen"',
    '(Founder OR CEO) "Short-Form Agency"',
    '(Founder OR CEO) "Content Strategy"'
];

async function runXHarvester() {
    log("🚀 Launching 24/7 X (Twitter) Founder Discovery Engine...");
    const browser = await chromium.launch({ headless: true });
    
    // Note: X highly requires a session for deep searching. 
    // This script assumes you have a skool_storage_state.json with X cookies if needed.
    const context = fs.existsSync(paths.STORAGE_STATE_FILE)
        ? await browser.newContext({ storageState: paths.STORAGE_STATE_FILE, viewport: { width: 1280, height: 720 } })
        : await browser.newContext({ viewport: { width: 1280, height: 720 } });

    const page = await context.newPage();

    try {
        for (const query of QUERIES) {
            log(`🔎 Searching X for: ${query}`);
            const encodedQuery = encodeURIComponent(query);
            const url = `https://x.com/search?q=${encodedQuery}&f=user`;
            
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(5000);

            log(`🏊 Scrolling through X user results...`);
            for (let i = 0; i < 15; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(2000);
                updateHeartbeat();
            }

            const founders = await page.evaluate(() => {
                const results = [];
                const userCells = Array.from(document.querySelectorAll('[data-testid="UserCell"]'));
                
                userCells.forEach(cell => {
                    const links = Array.from(cell.querySelectorAll('a'));
                    const nameElement = cell.querySelector('[data-testid="User-Name"]');
                    const bioElement = cell.querySelector('div[dir="auto"]'); // Simplified bio selector
                    
                    if (nameElement) {
                        const name = nameElement.innerText.split('\n')[0];
                        const handle = nameElement.innerText.split('\n')[1] || "";
                        const bio = bioElement ? bioElement.innerText : "";
                        const profileUrl = `https://x.com/${handle.replace('@', '')}`;
                        
                        results.push({ name, handle, bio, url: profileUrl, source: 'X' });
                    }
                });
                return results;
            });

            log(`✅ Found ${founders.length} potential founders on X.`);

            let db = loadJson(paths.DATABASE);
            const existingUrls = new Set(db.map(d => (d.url || "").toLowerCase()));
            
            let newCount = 0;
            founders.forEach(f => {
                if (!existingUrls.has(f.url.toLowerCase())) {
                    db.push({ 
                        name: f.name,
                        url: f.url,
                        ownerName: f.name,
                        socials: { x: f.url, ig: null, li: null },
                        niche: f.bio,
                        status: 'X_DISCOVERY_PENDING',
                        first_seen: new Date().toISOString()
                    });
                    newCount++;
                }
            });

            saveJson(paths.DATABASE, db);
            log(`💾 Saved ${newCount} new leads from X.`);
        }

    } catch (e) {
        log(`❌ X Harvester Error: ${e.message}`);
    } finally {
        await browser.close();
        log("🏁 X Discovery Cycle Complete.");
    }
}

async function main() {
    while (true) {
        try {
            await runXHarvester();
            log(`💤 Resting for 12 hours before next X audit...`);
            await new Promise(r => setTimeout(r, 12 * 60 * 60 * 1000));
        } catch (e) {
            log(`Main loop error: ${e.message}`);
            await new Promise(r => setTimeout(r, 60000));
        }
    }
}

main().catch(console.error);
