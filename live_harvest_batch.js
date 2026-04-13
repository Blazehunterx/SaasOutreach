import fs from 'fs';
import https from 'https';

const PATHS = {
    QUALIFIED: 'c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/skool_qualified_from_skoolers.json',
    SENT: 'c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/sent_leads.json',
    OUTPUT_MD: 'c:/Users/marvi/OneDrive/Documenten/Playground/autonomous_factory_leads.md'
};

function normalize(url) {
    if (!url) return "";
    return url.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').replace(/\/$/, '').split('?')[0].trim();
}

async function getBingLeads(query) {
    return new Promise((resolve) => {
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
        
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const twitterMatches = data.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{4,15}/g) || [];
                const linkedinMatches = data.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/g) || [];
                resolve([...new Set([...twitterMatches, ...linkedinMatches])]);
            });
        }).on('error', () => resolve([]));
    });
}

async function main() {
    console.log("🚀 Starting Fresh Harvest Integration...");
    
    // 1. Load Skool Data
    let skoolBatch = [];
    try {
        const qualified = JSON.parse(fs.readFileSync(PATHS.QUALIFIED, 'utf8'));
        const sent = JSON.parse(fs.readFileSync(PATHS.SENT, 'utf8'));
        const contacted = new Set(sent.map(l => normalize(l.url)));
        
        // Target the latest ones (end of file) first
        skoolBatch = qualified.reverse().filter(l => l.ig && !contacted.has(normalize(l.ig))).slice(0, 20);
        console.log(`✅ Extracted ${skoolBatch.length} Uncontacted Skool Leads.`);
    } catch (e) {
        console.log(`⚠️ Skool Extract Warning: ${e.message}`);
    }

    // 2. Fresh Search (X and LinkedIn)
    console.log("🔎 Searching for Fresh X/LI Profiles...");
    const webLeads = await getBingLeads('site:twitter.com "Founder" "AI Automation" OR site:linkedin.com/in "CEO" "Short Form Agency"');
    console.log(`✅ Found ${webLeads.length} Fresh Web Leads.`);

    // 3. Generate Report
    let md = "# 🏆 Autonomous Factory: Fresh Batch #1\n\n";
    md += "| Type | Name / Link | Profile URL | Status |\n";
    md += "| :--- | :--- | :--- | :--- |\n";

    skoolBatch.forEach(l => {
        md += `| Skool | ${l.name ? l.name.replace(/\n/g, ' ') : 'Fresh Lead'} | [Instagram](${l.ig}) | READY |\n`;
    });

    webLeads.forEach(url => {
        const type = url.includes('linkedin') ? 'LinkedIn' : 'X/Twitter';
        md += `| ${type} | Web Discovery | [Profile](${url}) | READY |\n`;
    });

    fs.writeFileSync(PATHS.OUTPUT_MD, md);
    console.log(`🎯 Report saved to: ${PATHS.OUTPUT_MD}`);
}

main();
