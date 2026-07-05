// ============================================================
// FounderFlow — App Logic
// ============================================================

// --- Scroll Animations ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

// --- Demo Simulation ---
const DEFAULT_DM = "Saw your page — good stuff. I used to be a setter myself and built a tool that automates the manual DM grind. Saves me hours a day now. Curious — do you do your outreach manually or with a system?";

const SIMULATED_REPLIES = [
    "I do mine manually, takes forever. How does it work?",
    "Interesting. Tell me more about it.",
    "This is exactly what I need. How much does it cost?",
    "I've been looking for something like this. How do I get started?"
];

const AI_REPLIES = [
    "I feel that. Used to eat my mornings too. Short version: it finds leads, sends DMs, and an AI handles the replies until they're ready to book a call. Want a quick walkthrough?",
    "Basically it automates the whole outreach process — finding leads, sending DMs, handling replies. You just check the pipeline and jump on calls. Want me to show you how it works?",
    "Good question. I don't have a fixed price page — every setup is different. That's what the call is for. Happy to walk you through it: https://calendly.com/ayankhannn19/new-meeting",
    "Here's my calendar — pick a time that works. It's just a chat, no pitch deck: https://calendly.com/ayankhannn19/new-meeting"
];

function extractHandle(input) {
    if (!input) return null;
    input = input.trim().replace(/^@/, '');
    const m = input.match(/(?:instagram\.com|instagr\.am)\/([^\/\?#]+)/i);
    if (m) return m[1];
    if (/^[a-zA-Z0-9._]+$/.test(input)) return input;
    return null;
}

async function runSimulation() {
    const targetInput = document.getElementById('demo-target').value;
    const msgInput = document.getElementById('demo-msg').value;
    const handle = extractHandle(targetInput);

    if (!handle) {
        alert('Please enter a valid Instagram handle or URL.');
        return;
    }

    const dm = msgInput.trim() || DEFAULT_DM;

    // Hide input, show simulation
    document.getElementById('demo-input').style.display = 'none';
    document.getElementById('demo-simulation').classList.add('active');

    // Set handle in step descriptions
    document.getElementById('sim-handle').textContent = '@' + handle;

    // Pick a random reply scenario
    const replyIdx = Math.floor(Math.random() * SIMULATED_REPLIES.length);

    // Fill in previews
    document.getElementById('sim-dm-preview').textContent = dm;
    document.getElementById('sim-reply-preview').textContent = '@' + handle + ': "' + SIMULATED_REPLIES[replyIdx] + '"';
    document.getElementById('sim-ai-reply-preview').textContent = 'Marvin (AI): "' + AI_REPLIES[replyIdx] + '"';
    document.getElementById('sim-calendly-preview').innerHTML = '<i class="fas fa-link"></i> calendly.com/marvin-2000-sluis/founderflow<br><span style="color: var(--accent); font-size: 13px;">Meeting scheduled — 15 min call</span>';

    // Animate steps
    const steps = document.querySelectorAll('.sim-step');
    const totalSteps = steps.length;

    for (let i = 0; i < totalSteps; i++) {
        const step = steps[i];
        const icon = step.querySelector('.sim-step-icon');
        const preview = step.querySelector('.sim-step-preview');

        // Set active
        icon.classList.remove('pending');
        icon.classList.add('active');
        step.classList.add('visible');

        // Wait
        const delay = i === 4 ? 2000 : (i === 0 ? 1500 : 1200);
        await sleep(delay);

        // Set done
        icon.classList.remove('active');
        icon.classList.add('done');
        icon.innerHTML = '<i class="fas fa-check"></i>';

        // Show preview if exists
        if (preview) preview.classList.add('show');

        await sleep(400);
    }

    // Show result after a brief pause
    await sleep(1000);
    document.getElementById('demo-simulation').classList.remove('active');
    document.getElementById('demo-result').classList.add('active');
    document.getElementById('sim-result-text').textContent =
        'FounderFlow discovered @' + handle + ', sent a personalized DM, received a reply, the AI Setter handled the conversation, and a call was booked — all automatically.';
}

function resetSimulation() {
    document.getElementById('demo-input').style.display = 'block';
    document.getElementById('demo-simulation').classList.remove('active');
    document.getElementById('demo-result').classList.remove('active');

    // Reset steps
    document.querySelectorAll('.sim-step').forEach(step => {
        step.classList.remove('visible');
        const icon = step.querySelector('.sim-step-icon');
        icon.classList.remove('active', 'done');
        icon.classList.add('pending');
        const preview = step.querySelector('.sim-step-preview');
        if (preview) preview.classList.remove('show');
    });

    // Reset icons to original
    const icons = ['fa-search', 'fa-user-check', 'fa-pen', 'fa-paper-plane', 'fa-clock', 'fa-reply', 'fa-brain', 'fa-comment', 'fa-calendar-check'];
    document.querySelectorAll('.sim-step-icon').forEach((icon, i) => {
        icon.innerHTML = '<i class="fas ' + icons[i] + '"></i>';
    });

    // Clear inputs
    document.getElementById('demo-target').value = '';
    document.getElementById('demo-msg').value = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
