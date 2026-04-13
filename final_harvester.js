import fs from 'fs';
import https from 'https';

async function searchWeb(query) {
    return new Promise((resolve) => {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
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
    console.log("🚀 Running Final Harvest Discovery...");
    const webLeads = await searchWeb('site:twitter.com "Founder" "Agency" OR site:linkedin.com/in "AI Agency"');
    console.log(`✅ Found ${webLeads.length} Web Profiles.`);

    // Read the recovered skool leads
    const raw = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/all_leads_batch.json', 'utf8'));
    const sent = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/sent_leads.json', 'utf8'));
    const normalize = (u) => (u || "").toLowerCase().replace(/https?:\/\/|www\.|\/$/g, "").trim();
    const contacted = new Set(sent.map(l => normalize(l.url)));
    
    const freshSkool = raw.filter(l => l.ig && !contacted.has(normalize(l.ig))).slice(0, 15);

    let md = "# 🏆 Autonomous Factory: Fresh Lead Batch #1\n\n";
    md += "| Platform | Lead Type | Profile URL | Status |\n";
    md += "| :--- | :--- | :--- | :--- |\n";

    webLeads.forEach(url => {
        const type = url.includes('linkedin') ? 'LinkedIn' : 'X/Twitter';
        md += `| ${type} | Web Discovery | [Profile](${url}) | NEW |\n`;
    });

    freshSkool.forEach(l => {
        md += `| Skool | ${l.name || 'Founder'} | [Instagram](${l.ig}) | NEW |\n`;
    });

    fs.writeFileSync('c:/Users/marvi/OneDrive/Documenten/Playground/batch_1_leads.md', md);
    console.log("🎯 Table ready in batch_1_leads.md");
}

main();
