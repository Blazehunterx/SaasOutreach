import fs from 'fs';

function normalize(url) {
    if (!url) return "";
    return url.toLowerCase()
              .replace('http://', '')
              .replace('https://', '')
              .replace('www.', '')
              .replace(/\/$/, '') // Trailing slash
              .trim();
}

const ALL_LEADS = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/all_leads_batch_clean.json', 'utf8'));
const SENT_LEADS = JSON.parse(fs.readFileSync('c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/sent_leads.json', 'utf8'));

const contacted = new Set(SENT_LEADS.map(l => normalize(l.url)));

const freshLeads = ALL_LEADS.filter(l => !contacted.has(normalize(l.ig)));

const keywords = ['AI', 'Agency', 'Founder', 'CEO', 'Coach', 'Automation', '⭐', '🔥', 'Consulting', 'System'];
const highIntent = freshLeads.filter(l => {
    const text = (l.name + " " + (l.skoolProfile || "")).toLowerCase();
    return keywords.some(k => text.includes(k.toLowerCase()));
});

log(`Total Checked: ${ALL_LEADS.length}, Contacted: ${contacted.size}, Fresh: ${freshLeads.length}, High-Intent: ${highIntent.length}`);

const top50 = highIntent.slice(0, 50);
fs.writeFileSync('c:/Users/marvi/OneDrive/Documenten/Playground/gold_batch_leads_v2.json', JSON.stringify(top50, null, 4));

let md = "# 🚀 Master Outreach Batch: Automation Leads (v2)\n\n";
md += "| Name | Instagram | Skool Profile | Status |\n";
md += "| :--- | :--- | :--- | :--- |\n";
top50.forEach(l => {
    md += `| ${l.name.replace(/\n/g, ' ')} | [Profile](${l.ig}) | [Skool](${l.skoolProfile}) | READY |\n`;
});
fs.writeFileSync('c:/Users/marvi/OneDrive/Documenten/Playground/gold_batch_leads_v2.md', md);

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
