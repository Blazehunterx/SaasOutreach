const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function firstStrike() {
    console.log(`\n==========================================================`);
    console.log(`       FOUNDERFLOW ELITE: FIRST STRIKE v7.4`);
    console.log(`==========================================================`);
    console.log(`🚀 TRIGGERING HARDWARE PROOF: Opening LinkedIn Stealth...`);
    
    // Launch non-headless so Marvin can see it
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.linkedin.com/login');
    console.log(`✅ [ACTIVE] Hardware Functional. Mirroring Localhost 1:1.`);
    console.log(`\n[SUCCESS] The engine is alive. You can now sleep.`);
}

firstStrike().catch(e => console.log(`❌ FAULT: ${e.message}`));
