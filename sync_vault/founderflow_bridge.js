const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// --- PLATFORM DRIVERS ---
const igDriver = require('./drivers/ig');
const xDriver = require('./drivers/x');
const liDriver = require('./drivers/linkedin'); 
const metaDriver = require('./drivers/meta'); 
const gmailDriver = require('./drivers/gmail'); 
const emailDriver = require('./drivers/email'); 
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SESSION_DIR = 'sessions';
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR);

const LEADS_FILE = 'leads.json';
const SETTINGS_FILE = 'settings.json';

let outreachActive = false;
let loginBrowser = null;
let loginContext = null;

// ðŸŸ¢ Initial Load
if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ 
        "message": "Hi {{username}}, love your content!",
        "platform": "ig",
        "batchSize": 20,
        "minDelay": 120,
        "maxDelay": 240,
        "sessionLimit": 160
    }, null, 2));
}

// ðŸ” API Endpoints
app.get('/api/status', (req, res) => {
    try {
        let settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        const profileDir = path.resolve(SESSION_DIR, 'profiles', settings.platform);
        const emailConfigPath = path.join(SESSION_DIR, 'email_config.json');
        
        let status = fs.existsSync(profileDir) ? 'Connected' : 'Needs Login';
        if (settings.platform === 'gmail') {
            status = fs.existsSync(emailConfigPath) ? 'Connected' : 'Needs Config';
        }

        let emailConfig = null;
        if (fs.existsSync(emailConfigPath)) {
            emailConfig = JSON.parse(fs.readFileSync(emailConfigPath, 'utf8'));
        }
        
        res.json({ status, active: outreachActive, settings, emailConfig });
    } catch (e) {
        res.json({ status: 'Needs Login', active: false });
    }
});

app.post('/api/save-settings', (req, res) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.post('/api/save-email-config', (req, res) => {
    const emailConfigPath = path.join(SESSION_DIR, 'email_config.json');
    fs.writeFileSync(emailConfigPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.post('/api/upload-payload', upload.single('payload'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    let settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    settings.payloadPath = req.file.path;
    settings.payloadName = req.file.originalname;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    
    res.json({ success: true, filename: req.file.originalname });
});

app.post('/api/inject-leads', (req, res) => {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(req.body.leads, null, 2));
    res.json({ success: true, count: req.body.leads.length });
});

// ðŸš€ Unified Titanium Capture
app.post('/api/capture-session', async (req, res) => {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    const sessionFile = path.join(SESSION_DIR, `session_${settings.platform}.json`);
    const profileDir = path.resolve(SESSION_DIR, 'profiles', settings.platform);

    if (loginBrowser) {
        // ðŸ v1.29 TITANIUM SEAL: Extract Hot-Reload State before closing
        const page = loginBrowser.pages()[0];
        if (page) {
            const storage = await page.context().storageState();
            fs.writeFileSync(sessionFile, JSON.stringify(storage, null, 2));
        }

        await loginBrowser.close();
        loginBrowser = null;
        
        console.log(`âœ… TITANIUM SEAL COMPLETED: ${settings.platform.toUpperCase()}`);
        io.emit('status_update', { status: 'Connected', platform: settings.platform });
        res.json({ success: true, path: profileDir });
    } else {
        res.status(400).json({ error: 'No active login session' });
    }
});

// ðŸ” Lead Engine Endpoints
app.post('/api/login', async (req, res) => {
    try {
        if (loginBrowser || outreachActive) return res.json({ message: 'Hardware Busy' });
        
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        const loginUrls = {
            ig: 'https://www.instagram.com/accounts/login/',
            x: 'https://twitter.com/login',
            linkedin: 'https://www.linkedin.com/login'
        };

        const profileDir = path.resolve(SESSION_DIR, 'profiles', settings.platform);
        if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

        console.log(`ðŸ“¡ Opening Titanium Login Portal: ${settings.platform.toUpperCase()}`);
        
        loginBrowser = await chromium.launchPersistentContext(profileDir, { 
            headless: false,
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-position=0,0',
                '--no-sandbox'
            ]
        });
        
        const page = loginBrowser.pages()[0] || await loginBrowser.newPage();
        await page.goto(loginUrls[settings.platform] || loginUrls.ig, { timeout: 60000 });
        
        res.json({ message: `Login Portal Opened for ${settings.platform.toUpperCase()}` });
    } catch (e) {
        console.error('âŒ LOGIN ERROR:', e.message);
        if (loginBrowser) await loginBrowser.close();
        loginBrowser = null;
        res.status(500).json({ error: e.message });
    }
});

// ðŸ› ï¸ Universal Outreach Engine
async function startOutreach(socket) {
    if (outreachActive) return;
    outreachActive = true;
    
    let browser;
    let page;
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        const sessionFile = path.join(SESSION_DIR, `session_${settings.platform}.json`);
        
        socket.emit('log', { type: 'info', message: `ðŸš€ Starting TITANIUM Outreach [${settings.platform.toUpperCase()}] v1.58...` });
        
        if (!leads || leads.length === 0) {
            socket.emit('log', { type: 'warn', message: 'âš ï¸ Lead list is empty. Add leads first.' });
            outreachActive = false;
            return;
        }

        const isGmail = settings.platform === 'gmail';
        if (!isGmail) {
            socket.emit('log', { type: 'info', message: `âœ… Session Validated. Launching Titanium v1.58 hardware...` });
            
            const profileDir = path.resolve(SESSION_DIR, 'profiles', settings.platform);
            if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

            // ðŸ v1.29 GHOST SHELL: PERSISTENT HARDWARE
            browser = await chromium.launchPersistentContext(profileDir, { 
                headless: false,
                viewport: { width: 1280, height: 720 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--disable-infobars',
                    '--window-position=0,0',
                    '--no-sandbox'
                ]
            });
            
            // ðŸ v1.29 Titanium Inject: Re-inject Hot Backup
            if (fs.existsSync(sessionFile)) {
                const storage = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
                if (storage.cookies) {
                    await browser.addCookies(storage.cookies);
                    socket.emit('log', { type: 'info', message: `ðŸ” Titanium State Injected: ${storage.cookies.length} sessions re-hydrated.` });
                }
            }
            
            page = browser.pages()[0] || await browser.newPage();
        } else {
            socket.emit('log', { type: 'info', message: `âœ… SMTP Nexus Validated. Launching Browserless Outreach...` });
        }

        let batchCount = 0;
        let batchStartTime = Date.now();
        let processedLeads = 0;

        for (const lead of leads) {
            if (!outreachActive) break;
            
            // ðŸ›‘ 1. Session Limit (Dynamic)
            if (processedLeads >= (settings.sessionLimit || 160)) {
                socket.emit('log', { type: 'warn', message: `ðŸ Session Limit (${settings.sessionLimit}) reached. Shutting Down.` });
                break;
            }

            // ðŸ›‘ 2. Batch Pause (Dynamic)
            if (batchCount >= (settings.batchSize || 20)) {
                const elapsed = Date.now() - batchStartTime;
                if (elapsed < 60 * 60 * 1000) {
                    const waitTime = (60 * 60 * 1000) - elapsed;
                    socket.emit('log', { type: 'info', message: `â¸ï¸ Ghost Protocol: ${settings.batchSize} leads sent. Resting for ${Math.round(waitTime/60000)}m...` });
                    await new Promise(r => setTimeout(r, waitTime));
                }
                batchCount = 0;
                batchStartTime = Date.now();
            }
            
            try {
                if (settings.platform === 'ig') {
                    await igDriver.sendIG(page, lead, settings, socket);
                } else if (settings.platform === 'x') {
                    await xDriver.sendX(page, lead, settings, socket);
                } else if (settings.platform === 'linkedin') {
                    const result = await liDriver.sendLinkedIn(page, lead, settings, socket);
                    if (result === 'FATAL') {
                        socket.emit('log', { type: 'warn', message: 'ðŸ›‘ FATAL FAULT: Stopping Outreach to preserve browser state.' });
                        outreachActive = false;
                        break;
                    }
                } else if (settings.platform === 'meta') {
                    await metaDriver.sendMeta(page, lead, settings, socket);
                } else if (settings.platform === 'gmail') {
                    await emailDriver.sendEmail(lead, settings, socket);
                }
                
                batchCount++;
                processedLeads++;
                
                // â³ 3. Dynamic Humanized Delay
                const min = (settings.minDelay || 120) * 1000;
                const max = (settings.maxDelay || 240) * 1000;
                const delay = Math.floor(Math.random() * (max - min)) + min;
                socket.emit('log', { type: 'info', message: `ðŸ§¬ Ghost Protocol: Humanizing for ${Math.round(delay/1000)}s...` });
                if (page) await page.waitForTimeout(delay);
                else await new Promise(r => setTimeout(r, delay));
            } catch (driverErr) {
                socket.emit('log', { type: 'error', message: `âŒ Driver Error on ${lead.url.substring(0, 20)}: ${driverErr.message}` });
                socket.emit('progress', { url: lead.url, status: 'âŒ Failed' });
            }
        }
    } catch (e) {
        socket.emit('log', { type: 'error', message: `âŒ HARDWARE CRASH: ${e.message}` });
    } finally {
        outreachActive = false;
        if (browser) await browser.close();
        socket.emit('log', { type: 'info', message: 'ðŸ Outreach Session Ended.' });
    }
}

io.on('connection', (socket) => {
    socket.on('start_outreach', () => startOutreach(socket));
    socket.on('stop_outreach', () => { outreachActive = false; });
});

server.listen(3000, () => {
    console.log('ðŸš€ Founderflow UNIVERSAL Hub LIVE at http://localhost:3000');
});

// 🛡️ Founderflow Bridge v16.1: DASHBOARD TO LOCAL ENGINE
const { createClient } = require('@supabase/supabase-js');
const HUB_URL = 'https://zaqkctlrvebulnbvirzl.supabase.co';
const HUB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcWtjdGxydmVidWxuYnZpcnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODI1NiwiZXhwIjoyMDg4MzQ0MjU2fQ.NENzUeX60N4-U1OnUzG8s6J2efDyIZ_h6C-TtdK6Qjo';
const hub = createClient(HUB_URL, HUB_KEY);

hub.channel('dashboard-commands')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_settings' }, async (p) => {
    if (p.new && p.new.handshake === 'PENDING') {
        console.log('📡 Dashboard Signal Detected. Re-launching Localhead Engine...');
        startOutreach({ emit: (n, d) => console.log(n + ': ' + d) });
        await hub.from('campaign_settings').update({ handshake: 'CONNECTED' }).eq('id', p.new.id);
    }
  })
  .subscribe();
console.log('✅ BRIDGE ARMED: Dashboard is now linked to your Localhost Stable Engine.');