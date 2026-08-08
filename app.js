// ============================================================
// FounderFlow — Premium App Logic (2026 Edition)
// ============================================================

// --- Feature detection (graceful degradation if a CDN fails) ---
const hasLenis = typeof Lenis !== 'undefined';
const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const hasThree = typeof THREE !== 'undefined';

if (hasGsap) gsap.registerPlugin(ScrollTrigger);

// --- Lenis Smooth Scroll ---
let lenis = null;
if (hasLenis) {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger (single driver — no double raf)
    if (hasGsap) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.lagSmoothing(0);
    }
}

// --- Custom Cursor ---
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.08;
    cursorY += (mouseY - cursorY) * 0.08;
    dotX += (mouseX - dotX) * 0.3;
    dotY += (mouseY - dotY) * 0.3;
    cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
    cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects on interactive elements
document.querySelectorAll('a, button, .feature-card, .testimonial-card, .faq-item, .tech-item, .testimonial-quote, .funnel-layer, .dashboard-mock').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});

// --- Three.js Particle Background (Enhanced) ---
const canvas = document.getElementById('particle-canvas');
if (canvas && hasThree) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0x06d6a0),
        new THREE.Color(0xf472b6),
        new THREE.Color(0x38bdf8),
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 24;
        positions[i3 + 1] = (Math.random() - 0.5) * 24;
        positions[i3 + 2] = (Math.random() - 0.5) * 12;
        velocities[i3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 4 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Constellation lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(600 * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 5;

    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        const time = Date.now() * 0.0003;

        targetMouseX += (mouseX - targetMouseX) * 0.05;
        targetMouseY += (mouseY - targetMouseY) * 0.05;

        particles.rotation.x = time * 0.08 + targetMouseY * 0.15;
        particles.rotation.y = time * 0.12 + targetMouseX * 0.15;

        const posArray = geometry.attributes.position.array;
        const linePosArray = lineGeometry.attributes.position.array;
        let lineIndex = 0;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            posArray[i3] += velocities[i3];
            posArray[i3 + 1] += velocities[i3 + 1] + Math.sin(time + i * 0.3) * 0.0003;
            posArray[i3 + 2] += velocities[i3 + 2];

            // Drift back to center
            posArray[i3] += (0 - posArray[i3]) * 0.0001;
            posArray[i3 + 1] += (0 - posArray[i3 + 1]) * 0.0001;

            // Mouse repulsion
            const dx = posArray[i3] - targetMouseX * 6;
            const dy = posArray[i3 + 1] - targetMouseY * 4;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2.5) {
                const force = (2.5 - dist) * 0.008;
                posArray[i3] += dx * force;
                posArray[i3 + 1] += dy * force;
            }
        }

        // Constellation lines — connect nearby particles
        for (let i = 0; i < particleCount && lineIndex < 600; i += 3) {
            for (let j = i + 3; j < particleCount && lineIndex < 600; j += 3) {
                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < 1.8) {
                    linePosArray[lineIndex * 6] = posArray[i * 3];
                    linePosArray[lineIndex * 6 + 1] = posArray[i * 3 + 1];
                    linePosArray[lineIndex * 6 + 2] = posArray[i * 3 + 2];
                    linePosArray[lineIndex * 6 + 3] = posArray[j * 3];
                    linePosArray[lineIndex * 6 + 4] = posArray[j * 3 + 1];
                    linePosArray[lineIndex * 6 + 5] = posArray[j * 3 + 2];
                    lineIndex++;
                }
            }
        }
        for (let i = lineIndex * 6; i < 600 * 6; i++) linePosArray[i] = 0;
        lineGeometry.attributes.position.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }
    animateParticles();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- TextScramble (Scroll-linked) ---
class TextScramble {
    constructor(el) {
        this.el = el;
        this.originalHTML = el.innerHTML;
        this.chars = '!<>-_\\/[]{}—=+*^?#_abcdef0123456789';
        this.spans = [];
        this.finalChars = [];
        this.build();
    }
    build() {
        const text = this.el.textContent;
        this.el.innerHTML = '';
        this.el.style.display = 'inline';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i] === ' ' ? '\u00A0' : this.chars[Math.floor(Math.random() * this.chars.length)];
            span.style.display = 'inline-block';
            span.style.minWidth = text[i] === ' ' ? '0.3em' : 'auto';
            if (text[i] === ' ') span.style.width = '0.3em';
            this.el.appendChild(span);
            this.spans.push(span);
            this.finalChars.push(text[i]);
        }
    }
    scramble(progress) {
        const total = this.spans.length;
        const revealed = Math.floor(progress * total);
        for (let i = 0; i < total; i++) {
            if (i < revealed) {
                this.spans[i].textContent = this.finalChars[i] === ' ' ? '\u00A0' : this.finalChars[i];
                this.spans[i].style.color = '';
            } else if (i < revealed + 3) {
                this.spans[i].textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
                this.spans[i].style.color = 'var(--primary-light)';
            } else {
                this.spans[i].textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
                this.spans[i].style.color = 'var(--text-muted)';
            }
        }
    }
    reset() {
        this.spans.forEach((span, i) => {
            span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
            span.style.color = 'var(--text-muted)';
        });
    }
}

// --- Cursor Trail ---
const trailParticles = [];
const MAX_TRAIL = 8;
function spawnTrailDot(x, y) {
    if (trailParticles.length >= MAX_TRAIL) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    trailParticles.push(dot);
    setTimeout(() => { dot.style.opacity = '0'; dot.style.transform = 'scale(0)'; }, 50);
    setTimeout(() => { dot.remove(); trailParticles.shift(); }, 650);
}
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 40) {
        spawnTrailDot(e.clientX, e.clientY);
        lastTrailTime = now;
    }
});

// --- GSAP Scroll Animations (guarded) ---
if (hasGsap) {

// Recalculate trigger positions once all assets (images, fonts) are in
window.addEventListener('load', () => ScrollTrigger.refresh());

// Helper: run entrance animation without CSS transition conflicts,
// then restore transitions so hover effects stay smooth
function entrance(el, vars) {
    el.style.transition = 'none';
    gsap.from(el, {
        ...vars,
        onComplete: () => { el.style.transition = ''; },
    });
}

// Generic fade-in-up for any element not covered by specific selectors below
gsap.utils.toArray('.fade-in-up').forEach(el => {
    // Skip elements handled by specific stagger animations
    if (el.classList.contains('feature-card') ||
        el.classList.contains('testimonial-card') ||
        el.classList.contains('testimonial-quote') ||
        el.classList.contains('pricing-card') ||
        el.classList.contains('faq-item') ||
        el.classList.contains('tech-item') ||
        el.classList.contains('section-header') ||
        el.classList.contains('cta-box') ||
        el.classList.contains('video-wrapper')) return;

    entrance(el, {
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
    });
});

// Hero animation
gsap.from('.hero-badge', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.2,
});

gsap.from('.hero h1', {
    opacity: 0,
    y: 40,
    duration: 1,
    delay: 0.4,
});

gsap.from('.hero p', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.6,
});

gsap.from('.hero-actions', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.8,
});

// Stats counter animation
function animateCounter(el) {
    const target = el.textContent;
    const slashMatch = target.match(/^(\d+)\s*\/\s*(\d+)$/);
    let targetNum, suffix, useLocale = false;

    if (slashMatch) {
        targetNum = parseInt(slashMatch[1], 10);
        suffix = '/' + slashMatch[2];
    } else {
        targetNum = parseFloat(target.replace(/[^0-9.]/g, ''));
        if (isNaN(targetNum)) return;
        suffix = target.includes('%') ? '%' : (target.includes('+') ? '+' : '');
        useLocale = targetNum >= 1000;
    }

    let current = 0;
    const increment = targetNum / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
            current = targetNum;
            clearInterval(timer);
        }
        const n = Math.floor(current);
        el.textContent = (useLocale ? n.toLocaleString() : n) + suffix;
    }, 16);
}

document.querySelectorAll('.stat-num').forEach(el => {
    ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => animateCounter(el),
        once: true,
    });
});

// Feature cards stagger
gsap.utils.toArray('.feature-card').forEach((card, i) => {
    entrance(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        delay: i * 0.15,
    });
});

// Testimonial cards stagger
gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    entrance(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.7,
        delay: i * 0.1,
    });
});

// Testimonial quote cards stagger
gsap.utils.toArray('.testimonial-quote').forEach((card, i) => {
    entrance(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.7,
        delay: i * 0.15,
    });
});

// Pricing cards stagger
gsap.utils.toArray('.pricing-card').forEach((card, i) => {
    entrance(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.7,
        delay: i * 0.15,
    });
});

// FAQ items stagger
gsap.utils.toArray('.faq-item').forEach((item, i) => {
    entrance(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        x: -40,
        duration: 0.6,
        delay: i * 0.1,
    });
});

// Tech items stagger
gsap.utils.toArray('.tech-item').forEach((item, i) => {
    entrance(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        x: -50,
        duration: 0.7,
        delay: i * 0.12,
    });
});

// Pipeline steps stagger
gsap.utils.toArray('.pipeline-step').forEach((step, i) => {
    entrance(step, {
        scrollTrigger: {
            trigger: step,
            start: 'top 90%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        delay: i * 0.08,
    });
});

// Funnel: layers scale in from center, labels slide in
gsap.utils.toArray('.funnel-row').forEach((row, i) => {
    const layer = row.querySelector('.funnel-layer');
    const label = row.querySelector('.funnel-label');
    if (layer) {
        entrance(layer, {
            scrollTrigger: {
                trigger: row,
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            scaleX: 0,
            transformOrigin: 'center',
            duration: 0.6,
            delay: i * 0.07,
        });
    }
    if (label) {
        entrance(label, {
            scrollTrigger: {
                trigger: row,
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            x: -24,
            duration: 0.5,
            delay: i * 0.07,
        });
    }
});

// Funnel brackets, handover pill, and footer
gsap.utils.toArray('.funnel-bracket-inner').forEach(el => {
    entrance(el, {
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        x: -30,
        duration: 0.7,
    });
});

const handover = document.querySelector('.funnel-handover');
if (handover) {
    entrance(handover, {
        scrollTrigger: {
            trigger: handover,
            start: 'top 92%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.85,
        duration: 0.5,
    });
}

const funnelFooter = document.querySelector('.funnel-footer');
if (funnelFooter) {
    entrance(funnelFooter, {
        scrollTrigger: {
            trigger: funnelFooter,
            start: 'top 90%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
    });
}

// CTA box
const ctaBox = document.querySelector('.cta-box');
if (ctaBox) {
    entrance(ctaBox, {
        scrollTrigger: {
            trigger: ctaBox,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.8,
    });
}

// Section headers
gsap.utils.toArray('.section-header').forEach(header => {
    entrance(header, {
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
    });
});

// Video wrapper
const videoWrapper = document.querySelector('.video-wrapper');
if (videoWrapper) {
    entrance(videoWrapper, {
        scrollTrigger: {
            trigger: videoWrapper,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.9,
    });
}

// --- 3D Card Tilt Effect ---
document.querySelectorAll('.feature-card, .testimonial-card, .faq-item, .tech-item, .testimonial-quote').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -5;
        const rotateY = (x - centerX) / centerX * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// --- Magnetic Buttons ---
document.querySelectorAll('.btn-primary, .btn-accent').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) translateY(0)';
    });
});

// --- Text Reveal Animation ---
function splitTextIntoSpans_DISABLED(el) {
    const text = el.textContent;
    el.innerHTML = '';
    [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'char-reveal';
        span.style.transitionDelay = `${i * 0.03}s`;
        el.appendChild(span);
    });
}

// Char-split reveal disabled: Chrome breaks background-clip: text on
// gradient spans when child spans have transforms. The CSS gradient
// shift animation provides the heading effect instead.

// --- Parallax Depth Layers (decorative only — avoids transform conflicts with tilt/hover) ---
// Hero decoration ring drifts slower than page scroll
gsap.utils.toArray('.hero-decoration').forEach(el => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        },
        y: 120,
        scale: 1.15,
        ease: 'none',
    });
});

// Grid pattern scrolls at reduced speed for depth
const gridPattern = document.querySelector('.grid-pattern');
if (gridPattern) {
    gsap.to(gridPattern, {
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'max',
            scrub: 2,
        },
        backgroundPosition: '0px 300px',
        ease: 'none',
    });
}

} // end hasGsap guard

// --- TextScramble Scroll Animation ---
(function() {
    const headline = document.querySelector('.hero h1 .gradient-text');
    if (!headline || !hasGsap) return;
    const scrambler = new TextScramble(headline);
    // Start fully revealed — scramble as hero scrolls OUT of view
    scrambler.scramble(1);
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
            // Invert: 0 = fully visible, 1 = fully scrambled as hero leaves viewport
            scrambler.scramble(1 - self.progress);
        },
    });
})();

// --- Stat Bar Fill Animation ---
(function() {
    const fills = document.querySelectorAll('.stat-bar-fill');
    if (!fills.length || !hasGsap) return;
    fills.forEach((fill) => {
        const target = fill.getAttribute('data-width') || 0;
        gsap.fromTo(fill, { width: '0%' }, {
            width: target + '%',
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: fill.closest('.stat-bar'),
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });
})();

// --- Loading Intro ---
(function() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    if (sessionStorage.getItem('ff_loaded')) {
        overlay.style.display = 'none';
        return;
    }
    overlay.classList.add('active');
    setTimeout(() => {
        overlay.classList.add('exit');
        sessionStorage.setItem('ff_loaded', '1');
        setTimeout(() => { overlay.style.display = 'none'; }, 800);
    }, 1400);
})();

// --- Page Transitions ---
const pageTransition = document.querySelector('.page-transition');

// Animate overlay away on page load
if (pageTransition) {
    pageTransition.classList.add('entering');
    setTimeout(() => pageTransition.classList.remove('entering'), 600);
}

// Intercept internal navigation for smooth transitions
document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept same-site .html links
    if (href && href.endsWith('.html') && !href.startsWith('http')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (pageTransition) {
                pageTransition.classList.add('leaving');
                setTimeout(() => { window.location.href = href; }, 450);
            } else {
                window.location.href = href;
            }
        });
    }
});

// --- Demo Simulation (Original) ---
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

    document.getElementById('demo-input').style.display = 'none';
    document.getElementById('demo-simulation').classList.add('active');
    document.getElementById('sim-handle').textContent = '@' + handle;

    const replyIdx = Math.floor(Math.random() * SIMULATED_REPLIES.length);

    document.getElementById('sim-dm-preview').textContent = dm;
    document.getElementById('sim-reply-preview').textContent = '@' + handle + ': "' + SIMULATED_REPLIES[replyIdx] + '"';
    document.getElementById('sim-ai-reply-preview').textContent = 'Marvin (AI): "' + AI_REPLIES[replyIdx] + '"';
    document.getElementById('sim-calendly-preview').innerHTML = '<i class="fas fa-link"></i> calendly.com/marvin-2000-sluis/founderflow<br><span style="color: var(--accent); font-size: 13px;">Meeting scheduled — 15 min call</span>';

    const steps = document.querySelectorAll('.sim-step');
    const totalSteps = steps.length;

    for (let i = 0; i < totalSteps; i++) {
        const step = steps[i];
        const icon = step.querySelector('.sim-step-icon');
        const preview = step.querySelector('.sim-step-preview');

        icon.classList.remove('pending');
        icon.classList.add('active');
        step.classList.add('visible');

        const delay = i === 4 ? 2000 : (i === 0 ? 1500 : 1200);
        await sleep(delay);

        icon.classList.remove('active');
        icon.classList.add('done');
        icon.innerHTML = '<i class="fas fa-check"></i>';

        if (preview) preview.classList.add('show');

        await sleep(400);
    }

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

    document.querySelectorAll('.sim-step').forEach(step => {
        step.classList.remove('visible');
        const icon = step.querySelector('.sim-step-icon');
        icon.classList.remove('active', 'done');
        icon.classList.add('pending');
        const preview = step.querySelector('.sim-step-preview');
        if (preview) preview.classList.remove('show');
    });

    const icons = ['fa-search', 'fa-user-check', 'fa-pen', 'fa-paper-plane', 'fa-clock', 'fa-reply', 'fa-brain', 'fa-comment', 'fa-calendar-check'];
    document.querySelectorAll('.sim-step-icon').forEach((icon, i) => {
        icon.innerHTML = '<i class="fas ' + icons[i] + '"></i>';
    });

    document.getElementById('demo-target').value = '';
    document.getElementById('demo-msg').value = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Dashboard Mock Navigation ---
(function() {
    var navItems = document.querySelectorAll('.dm-nav-item');
    var panels = document.querySelectorAll('.dm-panel');
    var topbarTitle = document.getElementById('dm-topbar-title');
    var titles = { dashboard: 'Dashboard', pipeline: 'Pipeline', engine: 'Engine', settings: 'Settings' };

    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            var target = this.getAttribute('data-panel');

            navItems.forEach(function(n) { n.classList.remove('active'); });
            this.classList.add('active');

            panels.forEach(function(p) { p.classList.remove('active'); });
            var panel = document.querySelector('.dm-panel[data-panel="' + target + '"]');
            if (panel) panel.classList.add('active');

            if (topbarTitle) topbarTitle.textContent = titles[target] || target;
        });
    });
})();
