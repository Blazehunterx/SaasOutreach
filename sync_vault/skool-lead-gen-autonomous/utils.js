import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const paths = {
    DATABASE: path.join(__dirname, 'market_opportunities.json'),
    HEARTBEAT: path.join(__dirname, 'harvester_heartbeat.txt'),
    LOG: path.join(__dirname, 'harvester_internal.log')
};

export function log(msg) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${msg}\n`;
    console.log(entry.trim());
    try {
        fs.appendFileSync(paths.LOG, entry);
    } catch (e) {
        console.error(`Log write failed: ${e.message}`);
    }
}

export function updateHeartbeat() {
    try {
        fs.writeFileSync(paths.HEARTBEAT, new Date().toISOString());
    } catch (e) {}
}

export function saveJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (e) {
        log(`CRITICAL: JSON Save failed: ${e.message}`);
    }
}

export function loadJson(filePath, defaultValue = []) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        log(`Warning: Failed to load ${filePath}`);
    }
    return defaultValue;
}
