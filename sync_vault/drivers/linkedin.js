const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 🏁 v1.58: Infinity Sync - Total Resilience Hardware
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
            dot.style.backgroundColor = '#00ff00'; dot.style.borderRadius = '50%';
            dot.style.zIndex = '99999999'; dot.style.pointerEvents = 'none';
            dot.style.border = '2px solid white'; dot.style.boxShadow = '0 0 20px rgba(0,255,0,1)';
            document.body.appendChild(dot);
        }, {tx: x, ty: y});
    } catch (e) {}
}

async function purgeModals(p, socket) {
    if (!isAlive(p)) return;
    try {
        await p.evaluate(() => {
            const killers = ['.msg-overlay-list-bubble', '.msg-overlay-conversation-bubble', '.msg-overlay-bubble-header--sponsored', '#cm-restore-banner'];
            killers.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
            document.querySelectorAll('button[aria-label="Close"], button[aria-label="Sluiten"]').forEach(b => {
                if (!b.closest('.artdeco-modal')) b.click();
            });
        });
    } catch (e) {}
}

async function strikePhysical(p, socket, selector) {
    if (!isAlive(p)) return false;
    try {
        const loc = p.locator(selector).first();
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

async function handleInvitation(p, firstName, settings, socket) {
    socket.emit('log', { type: 'info', message: '🎯 Sentinel: Processing Invitation Modal...' });
    await p.waitForTimeout(2000);
    
    const noteBtn = p.locator('button:has-text("Opmerking toevoegen"), button:has-text("Add a note")').first();
    if (await noteBtn.isVisible()) {
        await noteBtn.click({ force: true });
        await p.waitForSelector('textarea#custom-message', { timeout: 5000 });
        let msg = settings.message.replace(/{{username}}/g, firstName);
        await p.locator('textarea#custom-message').type(msg, { delay: 65 });
        socket.emit('log', { type: 'info', message: '🎯 Sentinel: Message typed. Waiting for button hydration...' });
        await p.waitForTimeout(1500); 
    }

    const sendSels = ['.artdeco-modal button:has-text("Versturen")', '.artdeco-modal button:has-text("Verzenden")', '.artdeco-modal button:has-text("Send")', '.artdeco-modal .artdeco-button--primary'];
    for (const s of sendSels) {
        if (await strikePhysical(p, socket, s)) {
            socket.emit('log', { type: 'info', message: '✅ Sentinel: Invitation Sent.' });
            return true;
        }
    }
    return false;
}

async function sendLinkedIn(page, lead, settings, socket) {
    socket.emit('progress', { url: lead.url, status: 'Performing Universal Search...' });
    const killer = setInterval(() => { if (isAlive(page)) purgeModals(page, socket); }, 100);

    try {
        await page.goto(lead.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await page.waitForTimeout(6000);
        await purgeModals(page, socket);

        const fullName = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || 'Lead');
        const firstName = fullName.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
        socket.emit('log', { type: 'info', message: `🎯 Target: ${fullName}` });

        socket.emit('log', { type: 'info', message: '📡 Pushing v1.58 Infinity (Multi-Path Strike)...' });

        let outcome = 'FAILURE';

        // PATH 1: Direct Connect
        const primaryConn = page.locator('.pvs-profile-actions button:has-text("Connectie maken"), .pvs-profile-actions button:has-text("Connect")').first();
        if (await primaryConn.isVisible()) {
            await primaryConn.click({ force: true });
            if (await handleInvitation(page, firstName, settings, socket)) outcome = 'SUCCESS';
        }

        // PATH 2: Dropdown Connect
        if (outcome === 'FAILURE' && isAlive(page)) {
            const ellipsis = await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const mid = btns.filter(b => {
                    const r = b.getBoundingClientRect();
                    return r.top > 150 && r.top < 650 && r.width > 20;
                });
                const el = mid.find(b => b.querySelector('svg[data-test-icon="overflow-horizontal-ios"], svg[data-test-icon="horizontal-dots"]') || (b.getAttribute('aria-label')||'').toLowerCase().includes('meer'));
                return el ? { x: el.getBoundingClientRect().x + el.getBoundingClientRect().width/2, y: el.getBoundingClientRect().y + el.getBoundingClientRect().height/2 } : null;
            });

            if (ellipsis) {
                await paintTarget(page, ellipsis.x, ellipsis.y);
                await page.mouse.click(ellipsis.x, ellipsis.y);
                await page.waitForTimeout(2500); 
                const conn = page.locator('button:has-text("Connectie maken"), button:has-text("Connect"), [role="menuitem"]:has-text("Connect")').first();
                if (await conn.isVisible({ timeout: 4000 })) {
                     await conn.click({ force: true });
                     if (await handleInvitation(page, firstName, settings, socket)) outcome = 'SUCCESS';
                }
            }
        }

        // PATH 3: Already Connected (Direct Message)
        if (outcome === 'FAILURE' && isAlive(page)) {
            socket.emit('log', { type: 'warn', message: '🔍 Sentinel: Connection present. Initiating Direct Message path...' });
            const msgBtn = page.locator('.pvs-profile-actions button:has-text("Bericht"), .pvs-profile-actions button:has-text("Message")').first();
            if (await msgBtn.isVisible()) {
                await msgBtn.click({ force: true });
                await page.waitForTimeout(2500);
                const chatBox = page.locator('[role="textbox"], .msg-form__contenteditable').first();
                if (await chatBox.isVisible()) {
                    await chatBox.click();
                    let msg = settings.message.replace(/{{username}}/g, firstName);
                    await page.keyboard.type(msg, { delay: 60 });
                    await p.waitForTimeout(1000);
                    // Physical Send Strike for chat box
                    const finalSend = '.msg-form__send-button';
                    if (await strikePhysical(page, socket, finalSend)) {
                        socket.emit('log', { type: 'info', message: '✅ Sentinel: Message delivered via Chat.' });
                        outcome = 'SUCCESS';
                    }
                }
            }
        }

        clearInterval(killer);
        return outcome;
    } catch (e) {
        clearInterval(killer);
        socket.emit('progress', { url: lead.url, status: `❌ Fault: ${e.message.substring(0, 30)}` });
        return 'ERROR';
    }
}

module.exports = { sendLinkedIn };
