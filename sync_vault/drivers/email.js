const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendEmail(lead, settings, socket) {
    const CONFIG_PATH = path.join(__dirname, '../sessions/email_config.json');
    
    if (!fs.existsSync(CONFIG_PATH)) {
        socket.emit('log', { type: 'error', message: '❌ Email Error: Not Configured. Click "Connect Gmail" in the dashboard.' });
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    socket.emit('progress', { url: lead.url, email: lead.email, status: 'Preparing Gmail SMTP Outreach...' });

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.password, // This is the 16-char App Password
            },
        });

        // 🏁 HAKI Template Logic
        const contactPerson = lead.name || 'Founder';
        const rawMessage = settings.message.replace(/{{username}}/g, contactPerson).replace(/{{contact_person}}/g, contactPerson);
        const subject = settings.subject || `Quick note from Founderflow Hub`;

        let mailOptions = {
            from: `"${config.senderName || 'Founderflow'}" <${config.email}>`,
            to: lead.email || lead.url,
            subject: subject,
            html: rawMessage.replace(/\n/g, '<br>'),
            attachments: []
        };

        if (settings.payloadPath && fs.existsSync(settings.payloadPath)) {
            mailOptions.attachments.push({
                filename: settings.payloadName || 'proposal.pdf',
                path: settings.payloadPath
            });
        }

        let info = await transporter.sendMail(mailOptions);
        socket.emit('progress', { url: lead.url, email: lead.email, status: '✅ Email Sent Successfully (SMTP)' });
        return { success: true, messageId: info.messageId };
    } catch (e) {
        console.error('❌ GMAIL SMTP ERROR:', e.message);
        socket.emit('progress', { url: lead.url, email: lead.email, status: `❌ SMTP Error: ${e.message.substring(0, 20)}...` });
        return { success: false, error: e.message };
    }
}

module.exports = { sendEmail };
