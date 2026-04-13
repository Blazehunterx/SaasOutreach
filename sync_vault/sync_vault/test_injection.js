const { chromium } = require('playwright');
const path = require('path');

async function runTest() {
    console.log('🧪 STARTING DOM VALIDATION TEST (v1.5)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const filePath = 'file://' + path.resolve('debug_lexical.html');
    await page.goto(filePath);

    const longMessage = "This is a very long test message designed to verify that the Founderflow Unbreakable Injection v1.5 can deliver 100% of the characters without any truncation. " + 
                        "We are testing multiple paragraphs, special characters (!@#$%^&*), and high-fidelity React state synchronization. " +
                        "If this test passes, the character count below should match precisely what we injected.";

    console.log(`📤 ATTEMPTING INJECTION: ${longMessage.length} characters.`);

    // 🏆 INJECTION METHOD
    await page.locator('#mock-editor').click();
    await page.keyboard.insertText(longMessage);
    await page.waitForTimeout(500);

    // 🔍 VERIFICATION
    const resultText = await page.evaluate(() => document.getElementById('mock-editor').innerText);
    console.log(`📥 CAPTURED RESULT: ${resultText.length} characters.`);
    console.log(`📊 CONTENT: "${resultText.substring(0, 50)}..."`);

    if (resultText === longMessage) {
        console.log('✅ SUCCESS: 100% Data Delivery Verified on Mock DOM.');
    } else {
        console.log('❌ FAILURE: Truncation Detected.');
    }

    await browser.close();
}

runTest().catch(console.error);
