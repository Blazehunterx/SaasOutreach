const { chromium } = require('playwright');
const path = require('path');

async function captureProof() {
    console.log('[PROOFS] Capturing Physical Instagram State...');
    const browser = await chromium.launch({ headless: true }); // Headless for silent capture
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle' });
    const screenshotPath = 'C:\\Users\\marvi\\.gemini\\antigravity\\brain\\2cc93c7c-937c-4600-b46e-f4f813c7fcc2\\ig_restoration_proof.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('[SUCCESS] Visual proof captured at: ' + screenshotPath);
    await browser.close();
}
captureProof();