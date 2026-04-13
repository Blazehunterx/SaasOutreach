import fs from 'fs';
import https from 'https';

async function searchDDG(query) {
    return new Promise((resolve) => {
        // Using the lighter HTML version of DDG
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' };
        
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
    console.log("🚀 Launching DuckDuckGo Discovery Sweep...");
    
    // 1. Search for AI Agency Founders on X
    const xLeads = await searchDDG('site:twitter.com "Founder" "AI Agency"');
    console.log(`✅ Found ${xLeads.length} X/Twitter Leads.`);

    // 2. Search for Short-form Agency CEOs on LinkedIn
    const liLeads = await searchDDG('site:linkedin.com/in "CEO" "Short Form Video Agency"');
    console.log(`✅ Found ${liLeads.length} LinkedIn Leads.`);

    // 3. Look for skipped leads in the "RAW" database
    let rawSkoolExtra = [];
    try {
        const raw = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/all_leads_batch.json', 'utf8'));
        const sent = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/sent_leads.json', 'utf8'));
        const normalize = (u) => (u || "").toLowerCase().replace(/https?:\/\/|www\.|\/$/g, "").trim();
        const contacted = new Set(sent.map(l => normalize(l.url)));
        
        rawSkoolExtra = raw.filter(l => l.ig && !contacted.has(normalize(l.ig))).slice(0, 15);
        console.log(`✅ Recovered ${rawSkoolExtra.length} Raw Skool Leads.`);
    } catch (e) {
        console.log(`⚠️ Raw Recover Warning: ${e.message}`);
    }

    // 4. Final Output
    let md = "# 🏆 Autonomous Factory: Fresh Batch #1 (Confirmed)\n\n";
    md += "| Source | Lead / Type | Profile URL | Status |\n";
    md += "| :--- | :--- | :--- | :--- |\n";

    xLeads.forEach(url => md += `| X/Twitter | AI Founder | [Profile](${url}) | NEW |\n`);
    liLeads.forEach(url => md += `| LinkedIn | Agency CEO | [Profile](${url}) | NEW |\n`);
    rawSkoolExtra.forEach(l => md += `| Skool | ${l.name || 'Enriched Lead'} | [Instagram](${l.ig}) | NEW |\n`);

    fs.writeFileSync('c:/Users/marvi/OneDrive/Documenten/Playground/autonomous_factory_leads_v2.md', md);
    console.log("🎯 Fresh Multi-Platform Lead Table generated!");
}

main();
