import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { log, saveJson, loadJson, paths, updateHeartbeat } from './utils.js';

chromium.use(StealthPlugin());

const DORK_QUERIES = [
    'site:linkedin.com/in "Founder" "AI Automation Agency"',
    'site:linkedin.com/in "CEO" "AAA" "Automation"',
    'site:linkedin.com/in "Founder" "Lead Generation Agency"',
    'site:linkedin.com/in "Founder" "Short-Form Content Agency"',
    'site:linkedin.com/in "CEO" "Marketing Agency" "n8n"'
];

async function runLinkedInDorking() {
    log("🚀 Launching 24/7 LinkedIn Dorking Discovery Engine...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        for (const query of DORK_QUERIES) {
            log(`🔎 Dorking Google for LinkedIn Leads: ${query}`);
            const encodedQuery = encodeURIComponent(query);
            const url = `https://www.google.com/search?q=${encodedQuery}`;
            
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(5000);

            // Handle potential cookie Consent
            try {
                const consentButton = await page.$('button:has-text("Accept all")');
                if (consentButton) await consentButton.click();
            } catch (e) {}

            log(`🏊 Scraping Google search results...`);
            const linkedinLeads = await page.evaluate(() => {
                const results = [];
                const searchResults = Array.from(document.querySelectorAll('div.g'));
                
                searchResults.forEach(res => {
                    const titleElement = res.querySelector('h3');
                    const linkElement = res.querySelector('a');
                    const snippetElement = res.querySelector('div[style*="webkit-line-clamp"]');
                    
                    if (titleElement && linkElement) {
                        const title = titleElement.innerText;
                        const profileUrl = linkElement.href;
                        const snippet = snippetElement ? snippetElement.innerText : "";
                        
                        if (profileUrl.includes('linkedin.com/in/')) {
                            results.push({ 
                                name: title.split(' - ')[0].split(' | ')[0], 
                                profileUrl, 
                                bio: snippet,
                                source: 'LinkedIn-Dork'
                            });
                        }
                    }
                });
                return results;
            });

            log(`✅ Found ${linkedinLeads.length} LinkedIn profiles via Dorking.`);

            let db = loadJson(paths.DATABASE);
            const existingUrls = new Set(db.map(d => (d.url || "").toLowerCase()));
            
            let newCount = 0;
            linkedinLeads.forEach(l => {
                if (!existingUrls.has(l.profileUrl.toLowerCase())) {
                    db.push({ 
                        name: l.name,
                        url: l.profileUrl,
                        ownerName: l.name,
                        socials: { x: null, ig: null, li: l.profileUrl },
                        niche: l.bio,
                        status: 'LI_DORK_DISCOVERY_PENDING',
                        first_seen: new Date().toISOString()
                    });
                    newCount++;
                }
            });

            saveJson(paths.DATABASE, db);
            log(`💾 Saved ${newCount} new leads from LinkedIn Dorking.`);
            updateHeartbeat();
        }

    } catch (e) {
        log(`❌ LinkedIn Harvester Error: ${e.message}`);
    } finally {
        await browser.close();
        log("🏁 LinkedIn Discovery Cycle Complete.");
    }
}

async function main() {
    while (true) {
        try {
            await runLinkedInDorking();
            log(`💤 Resting for 24 hours before next Dorking cycle...`);
            await new Promise(r => setTimeout(r, 24 * 60 * 60 * 1000));
        } catch (e) {
            log(`Main loop error: ${e.message}`);
            await new Promise(r => setTimeout(r, 60000));
        }
    }
}

main().catch(console.error);
