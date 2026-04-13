const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function finalValidation() {
    console.log('🧪 Final Validation: Messaging Search Overlay (Dutch)...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    // 1. Expand/Focus Overlay
    const overlay = page.locator('.msg-overlay-bubble-header').first();
    await overlay.click();
    await page.waitForTimeout(2000);

    // 2. Identify Search Bar
    const searchBar = page.locator('input[placeholder*="zoeken" i], input[placeholder*="search" i]').first();
    if (await searchBar.isVisible()) {
        console.log('✅ Search bar found. Typing name...');
        await searchBar.fill('Nicholas Del Negro');
        await page.waitForTimeout(5000);

        // 3. Find Nicholas in the dropdown results
        const result = page.locator('.msg-overlay-list-bubble__convo-card').filter({ hasText: /Nicholas Del Negro/i }).first();
        if (await result.isVisible()) {
            console.log('✅ Found Nicholas in search results. Clicking...');
            await result.click();
            await page.waitForTimeout(5000);

            // 4. Final verification of the textbox
            const box = page.locator('[role="textbox"], .msg-form__contenteditable').last();
            if (await box.isVisible()) {
                console.log('🏆 SUCCESS: Direct connection to Nicholas established.');
                await box.fill('Founderflow Final Validation: Target Locked.');
                await page.screenshot({ path: 'linkedin_overlay_final_proof.png' });
            } else {
                console.log('❌ FAIL: Thread did not open after clicking search result.');
            }
        } else {
            console.log('❌ FAIL: Nicholas not found in search results.');
            await page.screenshot({ path: 'linkedin_overlay_search_fail.png' });
        }
    } else {
        console.log('❌ FAIL: Search bar not visible in overlay.');
    }

    await browser.close();
}

finalValidation();
