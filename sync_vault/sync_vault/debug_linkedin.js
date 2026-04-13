const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');
const path = require('path');

async function run() {
    const sessionFile = 'sessions/session_linkedin.json';
    if (!fs.existsSync(sessionFile)) {
        console.error('❌ No session found');
        return;
    }

    console.log('📡 Starting Hardware X-Ray...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ 
        storageState: sessionFile,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const targetUrl = 'https://www.linkedin.com/in/nicholas-del-negro/';
    console.log(`🔗 Navigating to: ${targetUrl}`);
    
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    // 📸 Take Screenshot
    const screenshotPath = 'linkedin_audit.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✅ Screenshot saved to: ${screenshotPath}`);

    // 🔍 Extract Header Info
    const h1Text = await page.innerText('h1').catch(() => 'NOT FOUND');
    console.log(`📝 H1 Text: ${h1Text}`);

    // 🔘 Extract All Buttons
    const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim(),
            aria: b.getAttribute('aria-label'),
            classes: b.className
        })).filter(b => b.text || b.aria);
    });

    console.log('🔘 BUTTON DUMP:');
    buttons.forEach((b, i) => {
        console.log(`[${i}] Text: "${b.text}" | Aria: "${b.aria}" | Classes: ${b.classes.substring(0, 50)}`);
    });

    await browser.close();
    console.log('🏁 X-Ray Complete.');
}

run();
