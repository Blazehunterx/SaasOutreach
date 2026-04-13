const { chromium } = require('playwright');

async function sendX(page, lead, settings, socket) {
    socket.emit('progress', { url: lead.url, status: 'Analyzing Profile...' });
    
    try {
        await page.goto(lead.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // 🏁 1. SMART NAME EXTRACTION (X Profile Header)
        let firstName = await page.evaluate(() => {
            try {
                // X Profile Header Name is usually the first <span> in the first <h2>
                const nameHeader = document.querySelector('[data-testid="UserName"] span');
                if (nameHeader) {
                    return nameHeader.innerText.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
                }
            } catch (e) {}
            return 'there';
        });
        if (!firstName || firstName.length > 15) firstName = 'there';
        socket.emit('log', { type: 'info', message: `Target identified: ${firstName}` });

        // 🏁 2. THE MESSAGE TRIGGER (X Standard DM Button)
        const dmBtn = page.locator('[data-testid="sendDMFromProfile"]');
        
        if (await dmBtn.isVisible()) {
            await dmBtn.click();
            await page.waitForTimeout(5000); // Wait for DM window

            // 🏁 3. INJECTION (X Lexical Editor)
            const box = page.locator('[data-testid="dmCompoundWidgetContainer"] [role="textbox"], [data-testid="dmInboxSecondaryMessages"] [role="textbox"]').last();
            
            if (await box.isVisible()) {
                await box.click();
                const message = settings.message.replace(/{{username}}/g, firstName);
                const lines = message.split('\n');

                // Humanized Line-by-Line Typing (Crucial for X Security)
                for (let i = 0; i < lines.length; i++) {
                    await page.keyboard.insertText(lines[i]);
                    if (i < lines.length - 1) {
                        await page.keyboard.down('Shift');
                        await page.keyboard.press('Enter');
                        await page.keyboard.up('Shift');
                    }
                }
                
                await page.waitForTimeout(2000);
                
                // Final Send
                const sendBtn = page.locator('[data-testid="dmComposerSendButton"]');
                if (await sendBtn.isEnabled()) {
                    await sendBtn.click();
                    socket.emit('progress', { url: lead.url, status: `✅ Sent to ${firstName}` });
                } else {
                    await page.keyboard.press('Enter');
                    socket.emit('progress', { url: lead.url, status: `✅ Sent to ${firstName} (Enter)` });
                }
            } else {
                socket.emit('progress', { url: lead.url, status: '⚠️ DM Box Hidden' });
            }
        } else {
            socket.emit('progress', { url: lead.url, status: '⚠️ Direct Message Disabled' });
        }
    } catch (e) {
        socket.emit('progress', { url: lead.url, status: `❌ Failed: ${e.message.substring(0, 20)}...` });
    }
}

module.exports = { sendX };
