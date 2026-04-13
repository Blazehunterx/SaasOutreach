const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function test() {
    console.log('🧪 Starting Live DOM Test: LinkedIn Message Trigger...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    const url = 'https://www.linkedin.com/in/nicholas-del-negro/';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    console.log('🔎 Hunting for the "Bericht/Message" primary button...');
    
    // We target the button that has the "Message" icon or text inside the profile actions container
    const selectors = [
        'button.pvs-profile-actions__action:has-text("Bericht")',
        'button.pvs-profile-actions__action:has-text("Message")',
        'button:has-text("Bericht")',
        '.pvs-profile-actions >> button:has-text("Bericht")',
        '.pvs-profile-actions >> button:has-text("Message")'
    ];

    let found = false;
    for (const s of selectors) {
        const btn = page.locator(s).first();
        if (await btn.isVisible()) {
            console.log(`✅ Found button with selector: ${s}`);
            await btn.click();
            found = true;
            break;
        }
    }

    if (!found) {
        console.log('❌ Primary button not found. Checking "More" (Meer) menu...');
        const moreBtn = page.locator('button:has-text("Meer"), button:has-text("More")').first();
        if (await moreBtn.isVisible()) {
            await moreBtn.click();
            await page.waitForTimeout(2000);
            const hiddenMsg = page.locator('.artdeco-dropdown__content button:has-text("Bericht"), .artdeco-dropdown__content button:has-text("Message")').first();
            if (await hiddenMsg.isVisible()) {
                console.log('✅ Found message button inside "More" menu.');
                await hiddenMsg.click();
                found = true;
            }
        }
    }

    if (found) {
        console.log('⏳ Waiting for Message Overlay...');
        await page.waitForTimeout(5000);
        
        // Take screenshot of the result
        await page.screenshot({ path: 'linkedin_dom_test.png' });
        console.log('📸 Screenshot saved to: linkedin_dom_test.png');

        const box = page.locator('[role="textbox"], .msg-form__contenteditable').last();
        if (await box.isVisible()) {
            console.log('✅ PASS: Message box is visible and ready.');
            await box.fill('Founderflow Hardware Validation Active.');
            await page.screenshot({ path: 'linkedin_injected_test.png' });
            console.log('📸 Injected screenshot saved to: linkedin_injected_test.png');
        } else {
            console.log('❌ FAIL: Button clicked but box did not appear.');
        }
    } else {
        console.log('❌ FAIL: No "Bericht" button identified on page.');
    }

    await browser.close();
}

test();
