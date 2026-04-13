const { chromium } = require('playwright');

async function sendGmail(page, lead, settings, socket) {
    socket.emit('progress', { url: lead.url, status: 'Preparing Gmail Outreach...' });
    
    try {
        // Direct link to Compose Window
        await page.goto('https://mail.google.com/mail/u/0/#inbox?compose=new', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(10000); // Allow Gmail heavy UI to load

        // 🏁 1. RECIPIENT (X Lead URL or Email if provided)
        const toField = page.getByRole('combobox', { name: 'To' }).first();
        if (await toField.isVisible()) {
            await toField.click();
            await page.keyboard.insertText(lead.url); // Use URL as fallback for email
            await page.keyboard.press('Enter');
        }

        // 🏁 2. SUBJECT
        const subjectField = page.getByPlaceholder('Subject').first();
        if (await subjectField.isVisible()) {
            await subjectField.click();
            await page.keyboard.insertText(`Quick note from Founderflow Hub`);
        }

        // 🏁 3. MESSAGE BODY
        const body = page.getByRole('textbox', { name: 'Message Body' }).first();
        
        if (await body.isVisible()) {
            await body.click();
            const message = settings.message.replace(/{{username}}/g, 'Founder');
            const lines = message.split('\n');

            for (let i = 0; i < lines.length; i++) {
                await page.keyboard.insertText(lines[i]);
                if (i < lines.length - 1) {
                    await page.keyboard.press('Enter');
                }
            }
            
            await page.waitForTimeout(2000);
            
            // 🏁 4. SEND (Control + Enter is the Gmail shortcut for Send)
            await page.keyboard.down('Control');
            await page.keyboard.press('Enter');
            await page.keyboard.up('Control');
            
            socket.emit('progress', { url: lead.url, status: '✅ Email Sent Successfully' });
        } else {
            socket.emit('progress', { url: lead.url, status: '⚠️ Gmail Box Missing' });
        }
    } catch (e) {
        socket.emit('progress', { url: lead.url, status: `❌ Failed: ${e.message.substring(0, 20)}...` });
    }
}

module.exports = { sendGmail };
