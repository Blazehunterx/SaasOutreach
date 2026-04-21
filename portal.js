async function executeDemoStrike() {
    const targetEl = document.getElementById('demo-target');
    const msgEl = document.getElementById('demo-msg');
    const btn = document.getElementById('demo-btn');
    const logs = document.getElementById('demo-logs');
    
    if (!targetEl.value) return alert('Please enter a target URL.');
    
    const targetUrl = targetEl.value;
    const message = msgEl.value;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-satellite fa-spin"></i> Dispatching...';
    
    logTerminal(`⚡ INITIALIZING QUANTUM SHAKE...`);
    logTerminal(`📡 TARGETING: ${targetUrl}`);
    logTerminal(`🛡️ FINGERPRINT VALIDATED. ACCESS GRANTED.`);

    try {
        // NOTE: If testing from Vercel, this should be your public tunnel URL (Cloudflare/ngrok)
        // or a relative path if the bridge is serving this file.
        const API_URL = (window.location.hostname === 'localhost') ? 'http://localhost:3001/api/demo-strike' : '/api/demo-strike';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUrl, message })
        });

        const data = await response.json();
        
        if (data.success) {
            logTerminal(`✅ SUCCESS: DEMO PAYLOAD DELIVERED.`);
            logTerminal(`🛰️ MISSION LOGGED IN MASTER PERSISTENCE.`);
            btn.innerHTML = '<i class="fas fa-check"></i> Strike Successful';
            btn.classList.add('btn-emerald');
        } else {
            logTerminal(`❌ FAILED: ${data.error || 'Unknown network breach.'}`);
            btn.disabled = false;
            btn.innerHTML = 'Retry Strike ⚡';
        }

    } catch (e) {
        logTerminal(`❌ CRITICAL ERROR: Handshake Timeout.`);
        logTerminal(`⚠️ Ensure the local Sovereign-Hub is live.`);
        btn.disabled = false;
        btn.innerHTML = 'Retry Strike ⚡';
    }
}

function logTerminal(msg) {
    const logs = document.getElementById('demo-logs');
    const entry = document.createElement('div');
    entry.style.marginBottom = '8px';
    entry.innerHTML = `<span style="opacity: 0.3;">[${new Date().toLocaleTimeString()}]</span> > ${msg}`;
    logs.prepend(entry);
}
