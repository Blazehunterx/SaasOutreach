import fs from 'fs';
import path from 'path';

const LOG_DIR = 'c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/';
const SENT_FILE = 'c:/Users/marvi/.gemini/antigravity/scratch/ig_vm_deploy/sent_leads.json';
const OUTPUT_FILE = 'c:/Users/marvi/OneDrive/Documenten/Playground/Strategic_Design_Leads.json';

function normalize(url) {
    if (!url) return "";
    return url.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').replace(/\/$/, '').split('?')[0].trim();
}

async function siphonLogs() {
    console.log("🚀 Launching LOG SIPHON v1.75...");
    try {
        const sent = JSON.parse(fs.readFileSync(SENT_FILE, 'utf8'));
        const contacted = new Set(sent.map(l => normalize(l.url)));
        
        let batch = [];
        const files = fs.readdirSync(LOG_DIR).filter(f => f.startsWith('skool_internal') && f.endsWith('.log'));
        
        console.log(`🔎 Scanning ${files.length} log files for Design Whales...`);
        
        for (const file of files) {
            const content = fs.readFileSync(path.join(LOG_DIR, file), 'utf8');
            const lines = content.split('\n');
            
            for (const line of lines) {
                if (line.toLowerCase().match(/design|brand|logo|agency|website|refresh|startup/)) {
                    const match = line.match(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}/);
                    if (match) {
                        const url = match[0];
                        if (!contacted.has(normalize(url)) && !batch.some(l => normalize(l.url) === normalize(url))) {
                            batch.push({
                                url,
                                platform: 'ig',
                                intent: line.includes('design') ? 'Design' : 'Branding',
                                name: 'Skool Intent Lead'
                            });
                        }
                    }
                }
                if (batch.length >= 50) break;
            }
            if (batch.length >= 50) break;
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(batch, null, 2));
        console.log(`✅ Siphoned ${batch.length} Design Whales into Strategic_Design_Leads.json.`);
    } catch (e) {
        console.log(`❌ Siphon ERROR: ${e.message}`);
    }
}

siphonLogs();
