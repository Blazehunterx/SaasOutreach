const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SESSION_FILE = 'session.json';
const LEADS_FILE = 'leads.json';
const SETTINGS_FILE = 'settings.json';

let outreachActive = false;
let loginBrowser = null;
let loginContext = null;

// 🟢 Initial Load
if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ message: "Hi {{username}}, love your content!" }));
}

// 🔐 API Endpoints
app.get('/api/status', (req, res) => {
    const status = fs.existsSync(SESSION_FILE) ? 'Connected' : 'Needs Login';
    let settings = { message: "" };
    if (fs.existsSync(SETTINGS_FILE)) { settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
    res.json({ status, active: outreachActive, settings });
});

app.post('/api/save-settings', (req, res) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.post('/api/inject-leads', (req, res) => {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(req.body.leads, null, 2));
    res.json({ success: true, count: req.body.leads.length });
});

// 🚀 Manual Session Capture
app.post('/api/capture-session', async (req, res) => {
    if (loginContext) {
        const storage = await loginContext.storageState();
        fs.writeFileSync(SESSION_FILE, JSON.stringify(storage, null, 2));
        if (loginBrowser) await loginBrowser.close();
        loginContext = null;
        loginBrowser = null;
        io.emit('status_update', { status: 'Connected' });
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'No active login session' });
    }
});

app.post('/api/login', async (req, res) => {
    if (loginBrowser) return res.json({ message: 'Login Portal Already Open' });
    res.json({ message: 'Login Portal Opening...' });
    
    loginBrowser = await chromium.launch({ headless: false });
    const contextOptions = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' };
    if (fs.existsSync(SESSION_FILE)) { contextOptions.storageState = SESSION_FILE; }
    
    loginContext = await loginBrowser.newContext(contextOptions);
    const page = await loginContext.newPage();
    await page.goto('https://www.instagram.com/accounts/login/');
});

// 🛠️ Outreach Engine (MARVIN MEDIA STANDARD v1.6)
async function startOutreach(socket) {
    if (outreachActive) return;
    outreachActive = true;
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    
    socket.emit('log', { type: 'info', message: '🚀 Starting GOLD STANDARD Outreach...' });
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ 
        storageState: SESSION_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    for (const lead of leads) {
        if (!outreachActive) break;
        socket.emit('progress', { url: lead.url, status: 'Analyzing Profile...' });
        
        try {
            await page.goto(lead.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(7000); // Wait for profile header to settle

            // 🏁 1. SMART NAME EXTRACTION (Force-Sync Standard)
            let firstName = await page.evaluate(() => {
                try {
                    const header = document.querySelector('header');
                    if (!header) return 'there';
                    const allText = Array.from(header.querySelectorAll('span, h1, h2, div'))
                        .map(el => el.innerText.trim())
                        .filter(t => t.length > 1 && t.length < 30);
                    const handle = header.querySelector('h2')?.innerText.trim() || '';
                    const displayName = allText.find(t => t !== handle && !t.includes('follow') && !t.includes('Message'));
                    if (displayName) return displayName.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
                } catch (e) {}
                return 'there';
            });
            if (!firstName || firstName.length > 15) firstName = 'there';
            socket.emit('log', { type: 'info', message: `Target identified: ${firstName}` });

            // 🏁 2. THE FORCE-SEND TRIGGER (Primary vs Options Menu)
            let messageTriggered = false;
            const primaryBtn = page.locator('div[role="button"]:has-text("Message"), button:has-text("Message")').first();
            
            if (await primaryBtn.isVisible()) {
                await primaryBtn.click();
                messageTriggered = true;
            } else {
                const more = page.locator('header svg[aria-label*="Option"], header svg[aria-label*="More"]').first();
                if (await more.isVisible()) {
                    await more.click();
                    await page.waitForTimeout(3000);
                    const sendOpt = page.locator('button:has-text("Send Message"), button:has-text("Message")').first();
                    if (await sendOpt.isVisible()) {
                        await sendOpt.click();
                        messageTriggered = true;
                    }
                }
            }

            if (messageTriggered) {
                await page.waitForTimeout(10000); // Transition to DM view
                const box = page.locator('div[aria-label="Message"][contenteditable="true"]').last();
                
                if (await box.isVisible()) {
                    await box.click();
                    const message = settings.message.replace(/{{username}}/g, firstName);
                    const lines = message.split('\n');

                    // 🏁 3. HUMANIZED TYPING
                    for (let i = 0; i < lines.length; i++) {
                        await page.keyboard.insertText(lines[i]);
                        if (i < lines.length - 1) {
                            await page.keyboard.down('Shift');
                            await page.keyboard.press('Enter');
                            await page.keyboard.up('Shift');
                        }
                    }
                    
                    await page.waitForTimeout(2000);
                    await page.keyboard.press('Enter');
                    
                    // Final Click if Enter was ignored by UI
                    const finalSend = page.locator('div[role="button"]:has-text("Send"), button:has-text("Send")').last();
                    if (await finalSend.isVisible()) await finalSend.click();

                    socket.emit('progress', { url: lead.url, status: `✅ Sent to ${firstName}` });
                } else {
                    socket.emit('progress', { url: lead.url, status: '⚠️ Chat Box Hidden' });
                }
            } else {
                socket.emit('progress', { url: lead.url, status: '⚠️ Message Button Missing' });
            }
            
            const delay = Math.floor(Math.random() * 45000) + 45000;
            await page.waitForTimeout(delay);
        } catch (e) {
            socket.emit('progress', { url: lead.url, status: `❌ Failed: ${e.message.substring(0, 20)}...` });
        }
    }

    outreachActive = false;
    await browser.close();
    socket.emit('log', { type: 'info', message: '🏁 Batch Complete.' });
}

io.on('connection', (socket) => {
    socket.on('start_outreach', () => startOutreach(socket));
    socket.on('stop_outreach', () => { outreachActive = false; });
});

server.listen(3000, () => {
    console.log('🚀 Founderflow GOLD STANDARD Hub LIVE at http://localhost:3000');
});
