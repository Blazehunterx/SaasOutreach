const { chromium } = require('playwright');
const fs = require('fs');

// 🏁 v1.58: Instagram Horizon - Sentinel Resilience Hardware
const isAlive = (p) => {
    try { return !p.isClosed() && p.context().browser()?.isConnected(); } catch (e) { return false; }
};

async function paintTarget(p, x, y) {
    if (!isAlive(p)) return;
    try {
        await p.evaluate(({tx, ty}) => {
            const old = document.getElementById('telemetry_dot');
            if (old) old.remove();
            const dot = document.createElement('div');
            dot.id = 'telemetry_dot';
            dot.style.position = 'fixed';
            dot.style.left = `${tx - 6}px`;
            dot.style.top = `${ty - 6}px`;
            dot.style.width = '12px'; dot.style.height = '12px';
            dot.style.backgroundColor = '#ff00ff'; dot.style.borderRadius = '50%';
            dot.style.zIndex = '99999999'; dot.style.pointerEvents = 'none';
            dot.style.border = '2px solid white'; dot.style.boxShadow = '0 0 20px rgba(255,0,255,1)';
            document.body.appendChild(dot);
        }, {tx: x, ty: y});
    } catch (e) {}
}

async function purgeModals(p, socket) {
    if (!isAlive(p)) return;
    try {
        await p.evaluate(() => {
            // KILLER: Remove Instagram "Not Now", "Save Info", "Turn on Notifications"
            const killers = ['button:has-text("Not Now")', 'button:has-text("Niet nu")', 'button:has-text("Opslaan")', 'button:has-text("Save Info")'];
            const selectors = ['div[role="dialog"]', '.x1n2onr6.x1vjfegm', '.x78zum5.xdt5ytf.x1n2onr6'];
            
            // Physical clicks on "Not Now" buttons
            document.querySelectorAll('button').forEach(b => {
                const t = b.innerText.toLowerCase();
                if (t.includes('not now') || t.includes('niet nu') || t.includes('opslaan') || t.includes('save info')) {
                    b.click();
                }
            });
            // DOM purging
            selectors.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
        });
    } catch (e) {}
}

async function strikePhysical(p, socket, selector) {
    if (!isAlive(p)) return false;
    try {
        const loc = p.locator(selector).last();
        const box = await loc.boundingBox();
        if (box) {
            const tx = box.x + box.width / 2;
            const ty = box.y + box.height / 2;
            await paintTarget(p, tx, ty);
            await p.mouse.click(tx, ty, { force: true });
            return true;
        }
        return false;
    } catch (e) { return false; }
}

async function sendIG(page, lead, settings, socket) {
    socket.emit('progress', { url: lead.url, status: 'Analyzing Instagram Profile...' });
    const killer = setInterval(() => { if (isAlive(page)) purgeModals(page, socket); }, 50);

    try {
        await page.goto(lead.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(6000);
        await purgeModals(page, socket);

        // Name Extraction Sync
        let firstName = await page.evaluate(() => {
            const h2 = document.querySelector('h2');
            if (h2) return h2.innerText.trim();
            return 'there';
        });
        firstName = firstName.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
        socket.emit('log', { type: 'info', message: `🎯 Target: ${firstName}` });

        socket.emit('log', { type: 'info', message: '📡 Pushing v1.58 Instagram Horizon (Sentinel Sync)...' });

        // Trigger DM UI
        const msgBtn = page.locator('div[role="button"]:has-text("Message"), button:has-text("Message")').first();
        if (await msgBtn.isVisible()) {
            const box = await msgBtn.boundingBox();
            if (box) {
                const tx = box.x + box.width/2;
                const ty = box.y + box.height/2;
                await paintTarget(page, tx, ty);
                // Pulse-Strike (3 rapid clicks to bypass interaction traps)
                for(let i=0; i<3; i++) {
                    await page.mouse.click(tx, ty, { delay: 100 });
                    await page.waitForTimeout(200);
                }
            }
        }

        await page.waitForTimeout(8000); // Transition to IG Messages view
        const chatBox = page.locator('div[aria-label="Message"][contenteditable="true"], [role="textbox"]').last();
        
        if (await chatBox.isVisible()) {
            await chatBox.click();
            let msg = settings.message.replace(/{{username}}/g, firstName);
            await page.keyboard.type(msg, { delay: 65 });
            socket.emit('log', { type: 'info', message: '🎯 Sentinel: Message typed. Waiting for Send hydration...' });
            
            await page.waitForTimeout(2000);
            
            // Physical Send Strike
            const sendSels = ['div[role="button"]:has-text("Send")', 'button:has-text("Send")', 'div[role="button"]:has-text("Verzenden")'];
            let sent = false;
            for (const s of sendSels) {
                if (await strikePhysical(page, socket, s)) {
                    sent = true;
                    socket.emit('log', { type: 'info', message: '✅ Sentinel: Final IG Strike Delivered.' });
                    break;
                }
            }
            if (!sent) await page.keyboard.press('Enter');

            socket.emit('progress', { url: lead.url, status: `✅ Sent to ${firstName}` });
        } else {
             socket.emit('log', { type: 'error', message: '❌ Sentinel: IG Chat Box not found after pivot.' });
        }

        clearInterval(killer);
        return 'SUCCESS';
    } catch (e) {
        clearInterval(killer);
        socket.emit('progress', { url: lead.url, status: `❌ Fault: ${e.message.substring(0, 30)}` });
        return 'ERROR';
    }
}

module.exports = { sendIG };
