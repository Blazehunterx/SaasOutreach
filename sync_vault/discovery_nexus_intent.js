import fs from 'fs';
import https from 'https';
import path from 'path';

async function searchDDG(query) {
    return new Promise((resolve) => {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' };
        
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const twitterMatches = data.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{4,15}/g) || [];
                const linkedinMatches = data.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/g) || [];
                const instagramMatches = data.match(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{4,30}\//g) || [];
                resolve([...new Set([...twitterMatches, ...linkedinMatches, ...instagramMatches])]);
            });
        }).on('error', () => resolve([]));
    });
}

async function startNexus() {
    console.log("🚀 Launching Discovery Nexus v1.71: INTENT MODE");
    const queries = [
        'site:linkedin.com "looking for rebranding"',
        'site:linkedin.com "brand refresh needed"',
        'site:linkedin.com "packaging design agency"',
        'site:twitter.com "starting a new business" "branding"',
        'site:twitter.com "repositioning my brand"',
        'site:instagram.com "startup founder" "logo design"',
        'site:instagram.com "looking for social media refresh"'
    ];

    let allLeads = [];
    for (const q of queries) {
        console.log(`🔎 Scanning: ${q}...`);
        const leads = await searchDDG(q);
        console.log(`   ✅ Unmasked ${leads.length} targets.`);
        leads.forEach(url => {
            const platform = url.includes('linkedin') ? 'linkedin' : (url.includes('instagram') ? 'ig' : 'x');
            allLeads.push({ 
                url, 
                platform, 
                intent: q.split('"')[1], 
                name: 'Strategic Lead',
                timestamp: new Date().toISOString()
            });
        });
        // 🏁 Ghost Delay to avoid detection
        await new Promise(r => setTimeout(r, 2000));
    }

    // 🏆 Phase 2: Separate Registry Generation
    const STRATEGIC_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/Strategic_Design_Leads.json';
    fs.writeFileSync(STRATEGIC_FILE, JSON.stringify(allLeads, null, 2));
    console.log(`\n💎 Strategic Design Vault updated: ${allLeads.length} High-Intent Leads unmasked.`);

    // 🏁 Phase 3: Hub Markdown Output
    let md = "# 🛡️ Strategic Intent Batch: Rebranding & Design (v1.71)\n\n";
    md += "| Platform | Target Intent | Profile URL | Status |\n";
    md += "| :--- | :--- | :--- | :--- |\n";
    allLeads.forEach(l => {
        md += `| ${l.platform.toUpperCase()} | ${l.intent} | [View Profile](${l.url}) | 💎 HOT |\n`;
    });

    const MD_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/Strategic_Intent_Report.md';
    fs.writeFileSync(MD_FILE, md);
    console.log(`📊 Strategic Intent Report generated: ${MD_FILE}`);
}

startNexus();
