import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { log, saveJson, loadJson, paths, updateHeartbeat } from './utils.js';

chromium.use(StealthPlugin());

const CATEGORIES = ['business', 'marketing', 'sales', 'health-fitness', 'ai-automation', 'real-estate', 'tech'];

async function runHarvester() {
    log("🚀 Launching 24/7 Skool Discovery & Audit Engine (Isolated Project)...");
    const browser = await chromium.launch({ headless: true });
    // Note: No storage state used here to maintain clean isolation, but can be added if login provided.
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        // --- PHASE 1: DISCOVERY ---
        for (const cat of CATEGORIES) {
            log(`🔎 Auditing Category: ${cat.toUpperCase()}`);
            const url = `https://www.skool.com/discovery?c=${cat}`;
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(5000);

            log(`🏊 Scrolling to expand grid...`);
            for (let i = 0; i < 20; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(1000);
                updateHeartbeat();
            }

            const cards = await page.evaluate(() => {
                const results = [];
                const links = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('skool.com/') && !a.href.includes('/@') && !a.href.includes('/discovery'));
                links.forEach(l => {
                    const text = l.innerText || "";
                    const memberMatch = text.match(/([\d.,]+)\s*members/i);
                    const name = text.split('\n')[0];
                    if (memberMatch) {
                        const members = parseInt(memberMatch[1].replace(/[,.]/g, ''));
                        results.push({ name, url: l.href, members });
                    }
                });
                return results;
            });

            const filtered = cards.filter(g => g.members >= 500 && g.members <= 5000);
            log(`✅ Found ${cards.length} groups. ${filtered.length} in target range (500-5000).`);

            let db = loadJson(paths.DATABASE);
            const existingUrls = new Set(db.map(d => d.url.toLowerCase()));
            
            filtered.forEach(g => {
                if (!existingUrls.has(g.url.toLowerCase())) {
                    db.push({ ...g, status: 'PENDING_AUDIT', first_seen: new Date().toISOString() });
                }
            });
            saveJson(paths.DATABASE, db);
        }

        // --- PHASE 2: DEEP AUDIT ---
        log("🕵️ Starting Deep Audit on Pending Groups...");
        let db = loadJson(paths.DATABASE);
        const pending = db.filter(l => l.status === 'PENDING_AUDIT');

        for (const l of pending.slice(0, 30)) { // Process in batches of 30
            log(`🔍 Investigating: ${l.name} (${l.url})`);
            try {
                await page.goto(`${l.url}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(3000);

                const auditData = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a'));
                    const ownerLink = links.find(a => a.href.includes('skool.com/@'));
                    const igLink = links.find(a => a.href.includes('instagram.com/'));
                    const xLink = links.find(a => a.href.includes('twitter.com/') || a.href.includes('x.com/'));
                    const liLink = links.find(a => a.href.includes('linkedin.com/'));
                    
                    return {
                        ownerName: ownerLink ? ownerLink.innerText.split('\n')[0] : 'Unknown',
                        ownerProfile: ownerLink ? ownerLink.href : null,
                        socials: {
                            ig: igLink ? igLink.href : null,
                            x: xLink ? xLink.href : null,
                            li: liLink ? liLink.href : null
                        }
                    };
                });

                l.ownerName = auditData.ownerName;
                l.ownerProfile = auditData.ownerProfile;
                l.socials = auditData.socials;
                l.status = 'AUDITED';

                log(`✅ Verified Owner: ${l.ownerName} | IG: ${l.socials.ig || 'N/A'}`);
            } catch (e) {
                log(`⚠️ Audit failed for ${l.name}: ${e.message}`);
                l.status = 'AUDIT_FAILED';
            }
            saveJson(paths.DATABASE, db);
            updateHeartbeat();
        }

    } catch (e) {
        log(`❌ Harvester Fatal Error: ${e.message}`);
    } finally {
        await browser.close();
        log("🏁 Cycle Complete. Database updated.");
    }
}

async function main() {
    while (true) {
        try {
            await runHarvester();
            log(`💤 Sleeping for 6 hours before next check...`);
            await new Promise(r => setTimeout(r, 6 * 60 * 60 * 1000));
        } catch (e) {
            log(`Main loop error: ${e.message}`);
            await new Promise(r => setTimeout(r, 60000));
        }
    }
}

main().catch(console.error);
