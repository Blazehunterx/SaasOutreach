const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function snapshot() {
    console.log('🧪 Capturing Raw HTML Snapshot of Profile Actions...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/in/nicholas-del-negro/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    const html = await page.evaluate(() => {
        const pvs = document.querySelector('.pvs-profile-actions');
        return pvs ? pvs.innerHTML : 'CONTAINER NOT FOUND';
    });

    console.log('📄 RAW HTML:', html);
    
    // Attempt clicking by a broader text match
    const msgBtn = page.locator('button').filter({ hasText: /Bericht|Message/i }).first();
    if (await msgBtn.isVisible()) {
        console.log('✅ Button visible. Attempting Force Click...');
        await msgBtn.click({ force: true });
        await page.waitForTimeout(8000);
        await page.screenshot({ path: 'linkedin_post_force_click.png' });
        console.log('📸 Screenshot saved: linkedin_post_force_click.png');
    }

    await browser.close();
}

snapshot();
