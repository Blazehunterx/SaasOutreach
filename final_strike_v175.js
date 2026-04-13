import { chromium } from 'playwright';
import fs from 'fs';

const PATHS = {
    SESSION_LI: 'c:/Users/marvi/OneDrive/Documenten/Playground/sessions/session_linkedin.json',
    DESIGN_VAULT: 'c:/Users/marvi/OneDrive/Documenten/Playground/Strategic_Design_Leads.json'
};

async function finalStrike() {
    console.log("🚀 Launching FINAL STRATEGIC STRIKE v1.75...");
    const existingLeads = JSON.parse(fs.readFileSync(PATHS.DESIGN_VAULT, 'utf8'));
    const targetCount = 50;
    const needed = targetCount - existingLeads.length;

    if (needed <= 0) {
        console.log("✅ Target already reached.");
        return;
    }

    console.log(`🕵️‍♂️ Unmasking final ${needed} whales via LinkedIn Session...`);
    const browser = await chromium.launch({ headless: true });
    const state = JSON.parse(fs.readFileSync(PATHS.SESSION_LI, 'utf8'));
    const context = await browser.newContext({ storageState: state });
    const page = await context.newPage();

    try {
        await page.goto('https://www.linkedin.com/search/results/content/?keywords=looking%20for%20rebranding%20agency');
        await page.waitForTimeout(5000);

        const links = await page.evaluate(() => {
            const results = [];
            const anchors = Array.from(document.querySelectorAll('a'));
            anchors.forEach(a => {
                if (a.href.includes('linkedin.com/in/')) {
                    results.push(a.href);
                }
            });
            return [...new Set(results)];
        });

        console.log(`   ✅ Located ${links.length} potential profiles.`);
        
        let added = 0;
        for (const url of links) {
            if (added < needed && !existingLeads.some(l => l.url === url)) {
                existingLeads.push({
                    url,
                    platform: 'linkedin',
                    intent: 'Looking for Rebranding (LinkedIn Post)',
                    name: 'Strategic Lead'
                });
                added++;
            }
        }

        fs.writeFileSync(PATHS.DESIGN_VAULT, JSON.stringify(existingLeads, null, 2));
        console.log(`✅ FINAL BATCH COMPLETE: ${existingLeads.length}/50 Design Whales unmasked.`);
    } catch (e) {
        console.log(`❌ Strike ERROR: ${e.message}`);
    }

    await browser.close();
}

finalStrike();
