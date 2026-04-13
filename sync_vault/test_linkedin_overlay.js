const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function testOverlay() {
    console.log('🧪 Testing Overlay Search Path: LinkedIn...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/in/nicholas-del-negro/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    // 1. Ensure Overlay is open
    const chatHeader = page.locator('.msg-overlay-bubble-header').first();
    console.log('🔗 Clicking Messaging Header...');
    await chatHeader.click();
    await page.waitForTimeout(3000);

    // 2. Search for the name
    console.log('🔎 Searching for: Nicholas Del Negro');
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Zoeken"]').first();
    if (await searchInput.isVisible()) {
        await searchInput.fill('Nicholas Del Negro');
        await page.waitForTimeout(5000);

        // 3. Click the result
        const firstResult = page.locator('.msg-overlay-list-bubble__convo-card').first();
        if (await firstResult.isVisible()) {
            console.log('✅ Found result in overlay. Clicking...');
            await firstResult.click();
            await page.waitForTimeout(4000);

            // 4. Inject Test Message
            const box = page.locator('[role="textbox"], .msg-form__contenteditable').last();
            if (await box.isVisible()) {
                console.log('🏆 SUCCESS: Messaging box is open for Nicholas.');
                await box.fill('Test from Messaging Overlay Fallback.');
                await page.screenshot({ path: 'linkedin_overlay_success.png' });
                console.log('📸 Proof saved to: linkedin_overlay_success.png');
            } else {
                console.log('❌ FAIL: Thread did not open after search click.');
            }
        } else {
            console.log('❌ FAIL: No search results found.');
            await page.screenshot({ path: 'linkedin_overlay_fail.png' });
        }
    } else {
        console.log('❌ FAIL: Search input not found in overlay.');
    }

    await browser.close();
}

testOverlay();
