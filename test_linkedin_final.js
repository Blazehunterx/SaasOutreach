const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');

async function finalAudit() {
    console.log('🧪 Final Hardware Audit: LinkedIn Profile -> Message Box...');
    const sessionFile = 'sessions/session_linkedin.json';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/in/nicholas-del-negro/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    const btn = page.locator('button:has-text("Bericht"), button:has-text("Message")').first();
    if (await btn.isVisible()) {
        console.log('✅ Found Bericht button. Clicking...');
        await btn.click();
        await page.waitForTimeout(8000); // Massive wait for render

        // 🔍 Deep Audit of all Textboxes/Editable fields
        const audit = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('*')).filter(el => {
                const role = el.getAttribute('role');
                const contentEditable = el.getAttribute('contenteditable');
                const tagName = el.tagName;
                return role === 'textbox' || contentEditable === 'true' || tagName === 'TEXTAREA';
            }).map(el => ({
                tag: el.tagName,
                role: el.getAttribute('role'),
                class: el.className,
                placeholder: el.getAttribute('placeholder') || el.innerText.substring(0, 20)
            }));
        });

        console.log('📝 EDITABLE FIELDS FOUND:', audit);
        await page.screenshot({ path: 'linkedin_final_audit.png' });
        console.log('📸 Screenshot saved: linkedin_final_audit.png');
    } else {
        console.log('❌ FAIL: Bericht button vanished.');
    }

    await browser.close();
}

finalAudit();
