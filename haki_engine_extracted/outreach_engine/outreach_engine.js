const fs = require('fs');
const path = require('path');
const { sendEmail } = require('./email_sender');

/**
 * Outreach Engine - Haki Edition
 * Handles personalized pitch generation and bulk sending.
 */

async function generatePitch(shopName, templateType, contact_person = "[Contact Person]", region = "NL/BE/DE") {
    const templatesPath = path.join(__dirname, 'pitch_templates.json');
    if (!fs.existsSync(templatesPath)) {
        throw new Error(`Templates file not found at ${templatesPath}`);
    }

    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    const template = templates[templateType];

    if (!template) {
        throw new Error(`Template type '${templateType}' not found.`);
    }

    const subject = template.subject
        .replace(/{{shop_name}}/g, shopName)
        .replace(/{{region}}/g, region);

    const body = template.body
        .replace(/{{shop_name}}/g, shopName)
        .replace(/{{region}}/g, region)
        .replace(/{{contact_person}}/g, contact_person);

    return { subject, body };
}

async function runBulkOutreach(csvPath, templateType, intervalSeconds = 60) {
    if (!fs.existsSync(csvPath)) {
        console.error(`CSV file not found at ${csvPath}`);
        return;
    }

    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');

    console.log(`🚀 Starting bulk outreach for ${lines.length - 1} leads...`);

    for (let i = 1; i < lines.length; i++) {
        const [shopName, url, region, contact, email] = lines[i].split(',').map(s => s?.trim());

        if (!shopName || !email) {
            console.log(`⚠️ Skipping line ${i + 1}: Missing Shop Name or Email.`);
            continue;
        }

        console.log(`\n[${i}/${lines.length - 1}] 🛰️ Processing: ${shopName} (${email})`);

        try {
            const { subject, body } = await generatePitch(shopName, templateType, contact, region);
            const result = await sendEmail(email, subject, body.replace(/\n/g, '<br>'));

            if (result.success) {
                console.log(`✅ Success: Signal delivered to ${email}`);
            } else {
                console.log(`❌ Failed: ${result.error}`);
            }
        } catch (err) {
            console.error(`🚨 Error processing ${shopName}:`, err.message);
        }

        if (i < lines.length - 1) {
            console.log(`⏲️ Waiting ${intervalSeconds} seconds...`);
            await new Promise(res => setTimeout(res, intervalSeconds * 1000));
        }
    }

    console.log("\n🏁 Bulk outreach completed!");
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'bulk') {
        const csv = args[1];
        const type = args[2] || 'shop_pitch';
        const interval = parseInt(args[3]) || 60;
        runBulkOutreach(csv, type, interval);
    } else if (command === 'single') {
        const shop = args[1];
        const email = args[2];
        const type = args[3] || 'shop_pitch';
        const contact = args[4] || 'Partner';
        
        generatePitch(shop, type, contact).then(async ({ subject, body }) => {
            console.log(`\n--- DRAFT FOR ${shop} ---`);
            console.log(`To: ${email}\nSubject: ${subject}\n\n${body}\n------------------------\n`);
            
            if (args.includes('--send')) {
                console.log("📨 Sending now...");
                await sendEmail(email, subject, body.replace(/\n/g, '<br>'));
            }
        });
    } else {
        console.log("Haki Outreach Engine CLI");
        console.log("Usage:");
        console.log("  node outreach_engine.js bulk [csv_path] [template_type] [interval_seconds]");
        console.log("  node outreach_engine.js single [shop_name] [email] [template_type] [contact_name] [--send]");
    }
}

module.exports = { generatePitch, runBulkOutreach };
