const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function auditSearch() {
    console.log('🧪 Starting Search Result Audit: LinkedIn Overlay...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    // 1. Expand Overlay
    const header = page.locator('.msg-overlay-bubble-header, [data-control-name="overlay_head"]').first();
    await header.click();
    await page.waitForTimeout(3000);

    // 2. Search
    const search = page.locator('input[placeholder*="zoeken" i], input[placeholder*="search" i]').first();
    if (await search.isVisible()) {
        console.log('✅ Search bar found. Typing...');
        await search.type('Nicholas Del Negro', { delay: 150 });
        await page.waitForTimeout(8000);

        // 3. Scan Results
        const results = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.msg-overlay-list-bubble__convo-card, .msg-overlay-list-bubble__search-result-card, [role="link"]'))
                .map(el => ({ text: el.innerText.trim(), classes: el.className }))
                .filter(el => el.text.length > 0);
        });

        console.log('🔍 SEARCH RESULTS FOUND:', results);
        await page.screenshot({ path: 'linkedin_search_audit.png' });
    } else {
        console.log('❌ FAIL: Search bar not found.');
    }

    await browser.close();
}

auditSearch();
