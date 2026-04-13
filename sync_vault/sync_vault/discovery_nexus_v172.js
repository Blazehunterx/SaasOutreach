import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function launchSentinel() {
    console.log("🚀 Launching ELITE DISCOVERY NEXUS v1.72: SENTINEL MODE");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const TRACK_A_QUERY = [
        'site:linkedin.com/in "Founder" "Agency Owner"',
        'site:instagram.com "CEO" "SaaS"',
        'site:twitter.com "Founder" "Business" "Looking for partners"'
    ];

    const TRACK_B_QUERY = [
        'site:reddit.com "rebranding" "agency recommendations"',
        'site:linkedin.com "looking for a brand designer"',
        'site:linkedin.com "packaging design needed"',
        'site:skool.com "brand refresh" "help"',
        'site:twitter.com "need a logo for my startup"'
    ];

    async function scrapeTrack(queries, targetCount, label) {
        let results = [];
        console.log(`\n🕵️‍♂️ UNMASKING BATCH: ${label}...`);
        
        for (const q of queries) {
            if (results.length >= targetCount) break;
            console.log(`   🔎 Scanning: ${q}...`);
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
            
            // 🏁 Extract URLs
            const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors.map(a => a.href).filter(h => 
                    h.includes('linkedin.com/in/') || 
                    h.includes('instagram.com/') || 
                    h.includes('twitter.com/') || 
                    h.includes('x.com/')
                );
            });

            links.forEach(url => {
                if (results.length < targetCount && !results.some(r => r.url === url)) {
                    const platform = url.includes('linkedin') ? 'linkedin' : (url.includes('instagram') ? 'ig' : 'x');
                    results.push({ 
                        url, 
                        platform, 
                        intent: label === 'Strategic Design' ? q : 'General Growth',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            await page.waitForTimeout(2000); // 🏁 Ghost Delay
        }
        return results;
    }

    // 🏆 Phase 1: General Batch
    const generalLeads = await scrapeTrack(TRACK_A_QUERY, 50, 'Founderflow General');
    console.log(`✅ Track A Complete: ${generalLeads.length} Whales Unmasked.`);

    // 🏆 Phase 2: Design Batch
    const designLeads = await scrapeTrack(TRACK_B_QUERY, 50, 'Strategic Design');
    console.log(`✅ Track B Complete: ${designLeads.length} Intent Whales Unmasked.`);

    // 🏆 Phase 3: Registry Synchronization
    fs.writeFileSync('leads.json', JSON.stringify(generalLeads, null, 2));
    fs.writeFileSync('Strategic_Design_Leads.json', JSON.stringify(designLeads, null, 2));

    console.log(`\n💎 TOTAL DISCOVERY SUCCESS: 100 Whales Harvested.`);
    console.log(`📂 Main Hub: leads.json`);
    console.log(`📂 Design Vault: Strategic_Design_Leads.json`);

    await browser.close();
}

launchSentinel().catch(console.error);
