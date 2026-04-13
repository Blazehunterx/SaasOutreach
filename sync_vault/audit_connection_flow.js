const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function auditConnection() {
    console.log('🧪 Connection Audit: Testing "Connect with Note" Hardware (Dutch)...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    // Use a profile that likely needs a connection (User provided hint)
    // For this test, we just look at the selectors on a general profile action bar
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    console.log('🔎 Searching for global "Connect/Verbinden" signatures...');
    
    const audit = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(b => b.innerText.match(/Verbinden|Connect|Opmerking toevoegen/i))
            .map(b => ({ text: b.innerText.trim(), classes: b.className }));
    });

    console.log('📄 BUTTON SIGNATURES:', audit);
    await browser.close();
}

auditConnection();
