const nodemailer = require('nodemailer');
require('dotenv').config();

const delay = ms => new Promise(res => setTimeout(res, ms));

async function sendEmail(to, subject, htmlBody, attachments = [], waitTime = 3000) {
    if (waitTime > 0) {
        await delay(waitTime);
    }

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const signature = process.env.EMAIL_SIGNATURE || "";

    try {
        let mailOptions = {
            from: process.env.EMAIL_FROM || `"${process.env.SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            text: htmlBody.replace(/<[^>]*>?/gm, ''), // Basic strip HTML for plain text fallback
            html: htmlBody + signature,
            attachments: attachments
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmail };
