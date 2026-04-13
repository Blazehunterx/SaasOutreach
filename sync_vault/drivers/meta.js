const { chromium } = require('playwright');

async function sendMeta(page, lead, settings, socket) {
    socket.emit('progress', { url: lead.url, status: 'Analyzing Meta Profile...' });
    
    try {
        await page.goto(lead.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // 🏁 1. SMART NAME EXTRACTION (Meta Profile Name)
        let firstName = await page.evaluate(() => {
            try {
                const nameHeader = document.querySelector('h1');
                if (nameHeader) {
                    return nameHeader.innerText.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
                }
            } catch (e) {}
            return 'there';
        });
        if (!firstName || firstName.length > 15) firstName = 'there';
        socket.emit('log', { type: 'info', message: `Target identified: ${firstName}` });

        // 🏁 2. THE MESSAGE TRIGGER (Meta "Message" Button)
        const msgBtn = page.getByRole('button', { name: /Message/i }).first();
        
        if (await msgBtn.isVisible()) {
            await msgBtn.click();
            await page.waitForTimeout(5000); // Wait for chat window

            // 🏁 3. INJECTION (Meta Messenger Textbox)
            const box = page.getByRole('textbox', { name: /Message/i }).last();
            
            if (await box.isVisible()) {
                await box.click();
                const message = settings.message.replace(/{{username}}/g, firstName);
                const lines = message.split('\n');

                // Humanized Line-by-Line Typing
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
                
                socket.emit('progress', { url: lead.url, status: `✅ Sent to ${firstName}` });
            } else {
                socket.emit('progress', { url: lead.url, status: '⚠️ Messenger Box Hidden' });
            }
        } else {
            socket.emit('progress', { url: lead.url, status: '⚠️ Send Message Missing' });
        }
    } catch (e) {
        socket.emit('progress', { url: lead.url, status: `❌ Failed: ${e.message.substring(0, 20)}...` });
    }
}

module.exports = { sendMeta };
