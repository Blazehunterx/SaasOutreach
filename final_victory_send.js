const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function victorySend() {
    console.log('🧪 VICTORY SEND: Initiating Final LinkedIn Delivery...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    // 1. Trigger Compose
    const composeBtn = page.locator('[data-control-name="compose_message"], button:has-text("bericht opstellen"), button:has-text("Compose")').first();
    console.log('🔗 Clicking Compose Button...');
    await composeBtn.click();
    await page.waitForTimeout(5000);

    // 2. Type Recipient
    const recipient = page.locator('input[class*="typeahead__search-field"], input[placeholder*="naam"], input[placeholder*="name"]').first();
    if (await recipient.isVisible()) {
        console.log('✅ Recipient field found. Typing Nicholas Del Negro...');
        await recipient.type('Nicholas Del Negro', { delay: 150 });
        await page.waitForTimeout(6000);

        // 3. Select Result
        const result = page.locator('.msg-connections-typeahead__search-result, [role="option"]').filter({ hasText: /Nicholas Del Negro/i }).first();
        if (await result.isVisible()) {
            console.log('✅ Selecting Nicholas from dropdown...');
            await result.click();
            await page.waitForTimeout(5000);

            // 4. Type Message
            const box = page.locator('[role="textbox"], .msg-form__contenteditable').last();
            if (await box.isVisible()) {
                console.log('✅ Message box open. Typing message...');
                await box.fill('Founderflow Final Victory Delivery. Hardware Confirmed.');
                await page.waitForTimeout(2000);

                // 5. CLICK SEND
                const sendBtn = page.locator('button.msg-form__send-button, button:has-text("Verzenden"), button:has-text("Send")').last();
                console.log('🚀 CLICKING SEND...');
                await sendBtn.click();
                await page.waitForTimeout(5000);

                // 6. Screenshot Proof
                await page.screenshot({ path: 'linkedin_victory_proof.png' });
                console.log('🏆 SUCCESS: Final Victory Proof saved to linkedin_victory_proof.png');
            } else {
                console.log('❌ FAIL: Message box did not appear.');
            }
        } else {
            console.log('❌ FAIL: Nicholas not found in dropdown.');
            await page.screenshot({ path: 'victory_fail_search.png' });
        }
    } else {
        console.log('❌ FAIL: Recipient field not visible.');
        await page.screenshot({ path: 'victory_fail_recipient.png' });
    }

    await browser.close();
}

victorySend();
