// ═══════════════════════════════════════════════
// ═══ 3D LIGHTNING STORM CANVAS ═══
// ═══════════════════════════════════════════════
const canvas = document.getElementById('energy-canvas');
const ctx = canvas.getContext('2d');
let canvasActive = true;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', () => {
    canvasActive = !document.hidden;
    if (canvasActive) requestAnimationFrame(render);
});

// ─── Ambient particles ───
const particles = [];
for (let i = 0; i < 20; i++) {
    particles.push({
        x: Math.random() * 2000, y: Math.random() * 2000,
        size: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.1, vy: -Math.random() * 0.08 - 0.01,
        color: ['#00FFA3','#FF2D9B','#FFE066','#00E5FF'][Math.floor(Math.random()*4)],
        alpha: Math.random() * 0.2 + 0.05,
        pulse: Math.random() * 6.28, ps: Math.random() * 0.015 + 0.005
    });
}

// ─── LIGHT STREAKS (Enhanced — bigger, faster) ───
class LightStreak {
    constructor() { this.reset(); }
    reset() {
        this.active = false;
        this.timer = Math.random() * 80 + 60;
        this.points = [];
        this.life = 0;
        this.maxLife = 16;
        this.color = ['#00FFA3','#FF2D9B','#00E5FF'][Math.floor(Math.random()*3)];
    }
    update() {
        if (!this.active) {
            this.timer--;
            if (this.timer <= 0) {
                this.active = true;
                this.generatePath();
            }
            return;
        }
        this.life++;
        if (this.life >= this.maxLife) this.reset();
    }
    generatePath() {
        this.points = [];
        let x = Math.random() * canvas.width;
        let y = 0;
        for (let i = 0; i < 6; i++) {
            const nx = x + (Math.random() - 0.5) * 60;
            const ny = y + (canvas.height / 6);
            this.points.push({ x1: x, y1: y, x2: nx, y2: ny });
            x = nx; y = ny;
        }
    }
    draw() {
        if (!this.active) return;
        const a = 1 - this.life / this.maxLife;
        // Outer glow
        ctx.globalAlpha = a * 0.15;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        this.points.forEach(p => {
            ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
        });
        // Core line
        ctx.globalAlpha = a * 0.5;
        ctx.lineWidth = 1.5;
        this.points.forEach(p => {
            ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
        });
        // Bright center
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        this.points.forEach(p => {
            ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
        });
    }
}

const streaks = [];
for (let i = 0; i < 3; i++) streaks.push(new LightStreak());

function render() {
    if (!canvasActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ambient particles
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += p.ps;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        const a = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28); ctx.fill();
        ctx.globalAlpha = a * 0.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, 6.28); ctx.fill();
    });

    // Light streaks
    streaks.forEach(s => { s.update(); s.draw(); });

    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
}
render();

// ═══════════════════════════════════════════════
// ═══ LOADER & INIT ═══
// ═══════════════════════════════════════════════
window.addEventListener('load', async () => {
    await DataManager.init();
    renderProfileImage();
    renderProjects();
    initCVButton();
    initTextScramble();
    initHeroAnimations();
});

// ═══════════════════════════════════════════════
// ═══ HERO TEXT SCRAMBLE EFFECT ═══
// ═══════════════════════════════════════════════
function initTextScramble() {
    const fn = document.querySelector('.first-name');
    const ln = document.querySelector('.last-name');
    if (fn) fn.dataset.orig = fn.textContent;
    if (ln) ln.dataset.orig = ln.textContent;
}
function initHeroAnimations() {
    const fn = document.querySelector('.first-name');
    const ln = document.querySelector('.last-name');
    if (fn) scrambleText(fn, fn.dataset.orig, 55);
    setTimeout(() => { if (ln) scrambleText(ln, ln.dataset.orig, 35); }, 500);
}
function scrambleText(el, final, speed) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/';
    let iter = 0;
    const iv = setInterval(() => {
        el.textContent = final.split('').map((c, i) => {
            if (i < iter) return final[i];
            return c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iter >= final.length) clearInterval(iv);
        iter += 0.5;
    }, speed);
}

// ═══════════════════════════════════════════════
// ═══ CUSTOM CURSOR ═══
// ═══════════════════════════════════════════════
const isTouch = window.matchMedia('(pointer: coarse)').matches;
let setupCursorHovers = () => {};
if (!isTouch) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(loop);
    })();
    const addH = () => { dot.classList.add('hover'); ring.classList.add('hover'); };
    const remH = () => { dot.classList.remove('hover'); ring.classList.remove('hover'); };
    setupCursorHovers = () => {
        document.querySelectorAll('a,button,.btn,.skill-tag,.project-card,.contact-item,.contact-action,.submit-btn,.admin-btn,.admin-tab,.admin-icon-btn,.gallery-nav,.gallery-thumbs img').forEach(el => {
            el.removeEventListener('mouseenter', addH); el.removeEventListener('mouseleave', remH);
            el.addEventListener('mouseenter', addH); el.addEventListener('mouseleave', remH);
        });
    };
    setupCursorHovers();
}

// ═══════════════════════════════════════════════
// ═══ ENHANCED SCROLL REVEAL ═══
// ═══════════════════════════════════════════════
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function setupScrollReveal() {
    document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible),.reveal-scale:not(.visible),.reveal-rotate:not(.visible),.stagger-children:not(.visible),.divider-text:not(.visible)').forEach(el => revealObs.observe(el));
}
setupScrollReveal();

// ═══════════════════════════════════════════════
// ═══ STAT COUNTERS ═══
// ═══════════════════════════════════════════════
let statsDone = false;
new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsDone) {
            statsDone = true;
            document.querySelectorAll('.stat-number').forEach(stat => {
                const target = parseFloat(stat.dataset.target);
                const dec = stat.dataset.decimal === 'true';
                const start = performance.now(), dur = 2000;
                function tick(t) {
                    const p = Math.min((t - start) / dur, 1);
                    const e = 1 - Math.pow(1 - p, 4);
                    stat.textContent = dec ? (target * e).toFixed(2) : Math.floor(target * e);
                    if (p < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
        }
    });
}, { threshold: 0.4 }).observe(document.getElementById('stats-row'));

// GPA Counter
let gpaDone = false;
const gpaEl = document.getElementById('gpa-number');
if (gpaEl) {
    new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !gpaDone) {
                gpaDone = true;
                const start = performance.now();
                function tick(t) {
                    const p = Math.min((t - start) / 2000, 1);
                    gpaEl.textContent = (3.52 * (1 - Math.pow(1 - p, 4))).toFixed(2);
                    if (p < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            }
        });
    }, { threshold: 0.5 }).observe(gpaEl);
}

// ═══════════════════════════════════════════════
// ═══ DRAMATIC PARALLAX SCROLLING ═══
// ═══════════════════════════════════════════════
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scroll-progress');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        const sy = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;

        // Navbar glass
        navbar.classList.toggle('scrolled', sy > 50);

        // Progress bar
        if (scrollProgress) scrollProgress.style.width = Math.min(sy / docH * 100, 100) + '%';

        // DRAMATIC PARALLAX — hero elements move visibly
        document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const offset = (window.innerHeight / 2 - center) * speed;
            el.style.transform = `translateY(${offset}px)`;
        });

        // Parallax for float orbs — dramatic movement on scroll
        const scrollDelta = sy * 1.5;
        document.querySelectorAll('.float-orb').forEach((orb, i) => {
            const speeds = [0.4, -0.3, 0.25, -0.4, 0.2];
            const s = speeds[i] || 0.3;
            orb.style.transform = `translateY(${scrollDelta * s}px)`;
        });

        lastScrollY = sy;
    });
});

// ═══════════════════════════════════════════════
// ═══ FLOAT ORB MOUSE PARALLAX ═══
// ═══════════════════════════════════════════════
if (!isTouch) {
    document.addEventListener('mousemove', e => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        document.querySelectorAll('.float-orb').forEach(orb => {
            const speed = parseFloat(orb.dataset.speed) || 0.03;
            orb.style.transform = `translate(${cx * speed * 120}px, ${cy * speed * 120}px)`;
        });
    });
}

// ═══════════════════════════════════════════════
// ═══ HERO VIDEO PARALLAX ═══
// ═══════════════════════════════════════════════
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
    // Scroll parallax — video moves slower than scroll
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const sy = window.scrollY;
            const heroH = window.innerHeight;
            if (sy < heroH * 1.5) {
                heroVideo.style.transform = `translateY(${sy * 0.3}px)`;
            }
        });
    });

    // Pause video when not visible for performance
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heroVideo.play();
            } else {
                heroVideo.pause();
            }
        });
    }, { threshold: 0.1 });
    videoObserver.observe(heroVideo);
}

// ═══════════════════════════════════════════════
// ═══ MOBILE MENU ═══
// ═══════════════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
function closeMenu() { 
    hamburger.classList.remove('active'); 
    mobileMenu.classList.remove('active'); 
    mobileOverlay.classList.remove('active'); 
    document.body.style.overflow = '';
}
hamburger.addEventListener('click', () => { 
    const isActive = hamburger.classList.toggle('active'); 
    mobileMenu.classList.toggle('active'); 
    mobileOverlay.classList.toggle('active'); 
    document.body.style.overflow = isActive ? 'hidden' : '';
});
mobileOverlay.addEventListener('click', closeMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ═══════════════════════════════════════════════
// ═══ UTILITIES ═══
// ═══════════════════════════════════════════════
window.copyToClipboard = function(text) { navigator.clipboard.writeText(text).then(() => showToast('Copied ✓')); };
function showToast(msg) { const t = document.getElementById('toast'); if(t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); } }

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#admin') return;
        e.preventDefault();
        if (href === '#hero' || href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); closeMenu(); }
        else { const t = document.querySelector(href); if (t) { t.scrollIntoView({ behavior: 'smooth' }); closeMenu(); } }
    });
});

// ═══════════════════════════════════════════════
// ═══ 3D TILT EFFECT ═══
// ═══════════════════════════════════════════════
function initTiltEffects() {
    if (isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(600px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale3d(1.04,1.04,1.04)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)'; });
    });
}
initTiltEffects();

// ═══════════════════════════════════════════════
// ═══ RENDER PROFILE IMAGE ═══
// ═══════════════════════════════════════════════
window.renderProfileImage = function() {
    const frame = document.getElementById('about-image-frame');
    if (!frame) return;
    const img = DataManager.getProfileImage();
    if (img) {
        frame.innerHTML = `<img src="${img}" alt="Jayyid Jiddan" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);">`;
    } else {
        frame.innerHTML = `<img src="images/profile/Jaydan.png" alt="Jayyid Jiddan" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);" onerror="this.outerHTML='<div class=\\'about-image-placeholder\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\' width=\\'48\\' height=\\'48\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'12\\' cy=\\'10\\' r=\\'3\\'/><path d=\\'M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2\\'/></svg><div>Upload Foto di Admin</div></div>'">`;
    }
};

// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// ═══ RENDER PROJECTS — SIMPLE GRID LAYOUT ═══
// ═══════════════════════════════════════════════
window.renderProjects = function() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const projects = DataManager.getProjects();

    let html = '';
    projects.forEach((project, index) => {
        const tags = (project.tags || []).slice(0, 3).map(t => `<span class="project-tag-small">${t}</span>`).join('');
        const allImgs = [project.image, ...(project.images || [])].filter(Boolean);
        const revealClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';

        let imgHtml;
        if (allImgs.length > 0) {
            imgHtml = `
                <img src="${allImgs[0]}" alt="${project.title}" class="project-img-small" loading="lazy">
                <div class="project-overlay-small">
                    <span class="click-icon-small">🔍</span>
                </div>`;
        } else {
            imgHtml = `
                <div class="project-img-placeholder-small">
                    <span>No Image</span>
                </div>`;
        }

        html += `
        <article class="project-card-small ${revealClass}" data-project-id="${project.id}" onclick="openProjectModal('${project.id}')" data-parallax="0.05">
            <div class="project-thumb-small">${imgHtml}</div>
            <div class="project-info-small">
                <h4 class="project-title-small">${project.title}</h4>
                <div class="project-tags-small">${tags}</div>
            </div>
        </article>`;
    });

    grid.innerHTML = html;
    setupCursorHovers(); setupScrollReveal(); initTiltEffects();
};

// ═══════════════════════════════════════════════
// ═══ PROJECT DETAIL MODAL ═══
// ═══════════════════════════════════════════════
let galleryImgs = [], galleryIdx = 0;

window.openProjectModal = function(id) {
    const p = DataManager.getProjects().find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById('project-detail-modal');
    galleryImgs = [p.image, ...(p.images || [])].filter(Boolean);
    galleryIdx = 0;

    const mainImg = document.getElementById('gallery-main-img');
    if (galleryImgs.length > 0) { mainImg.src = galleryImgs[0]; mainImg.style.display = 'block'; }
    else { mainImg.src = ''; mainImg.style.display = 'none'; }

    const thumbs = document.getElementById('gallery-thumbs');
    if (galleryImgs.length > 1) {
        thumbs.innerHTML = galleryImgs.map((img, i) => `<img src="${img}" alt="Screenshot ${i+1}" class="${i===0?'active':''}" onclick="switchGallery(${i})">`).join('');
        thumbs.style.display = 'flex';
    } else { thumbs.innerHTML = ''; thumbs.style.display = 'none'; }

    updateCounter();
    document.getElementById('gallery-prev').style.display = galleryImgs.length > 1 ? 'flex' : 'none';
    document.getElementById('gallery-next').style.display = galleryImgs.length > 1 ? 'flex' : 'none';

    const dc = p.status === 'LIVE' ? 'var(--accent)' : 'var(--gold)';
    document.getElementById('modal-status').innerHTML = `<span class="live-dot" style="background:${dc};box-shadow:0 0 6px ${dc}"></span> ${p.status}`;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-tags').innerHTML = (p.tags||[]).map(t => `<span class="project-tag">${t}</span>`).join('');
    document.getElementById('modal-description').textContent = p.description;
    document.getElementById('modal-stack').innerHTML = p.stack ? `<strong>Tech Stack:</strong> ${p.stack}` : '';

    let links = '';
    if (p.liveUrl) links += `<a href="${p.liveUrl}" target="_blank" class="btn btn-primary btn-sm">🌐 Live Demo</a>`;
    if (p.githubUrl) links += `<a href="${p.githubUrl}" target="_blank" class="btn btn-secondary btn-sm">📂 GitHub</a>`;
    document.getElementById('modal-links').innerHTML = links;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setupCursorHovers();
};

window.switchGallery = function(i) {
    if (i < 0 || i >= galleryImgs.length) return;
    const dir = i > galleryIdx ? 1 : (i < galleryIdx ? -1 : 1);
    galleryIdx = i;
    
    const img = document.getElementById('gallery-main-img');
    
    // Start exit animation (slide out slightly and fade)
    img.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    img.style.transform = `scale(0.97) translateX(${dir * -20}px)`;
    img.style.opacity = '0';
    
    setTimeout(() => { 
        img.src = galleryImgs[i]; 
        
        // Reset to start position for enter animation
        img.style.transition = 'none';
        img.style.transform = `scale(1.03) translateX(${dir * 20}px)`;
        
        // Force reflow
        void img.offsetWidth;
        
        // Execute enter animation
        img.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        img.style.transform = 'scale(1) translateX(0)';
        img.style.opacity = '1'; 
    }, 250);
    
    document.querySelectorAll('#gallery-thumbs img').forEach((t, j) => t.classList.toggle('active', j === i));
    updateCounter();
};

function updateCounter() {
    const c = document.getElementById('gallery-counter');
    if (galleryImgs.length > 0) { c.textContent = `${galleryIdx+1} / ${galleryImgs.length}`; c.style.display = 'block'; }
    else c.style.display = 'none';
}

document.getElementById('gallery-prev')?.addEventListener('click', () => switchGallery((galleryIdx-1+galleryImgs.length)%galleryImgs.length));
document.getElementById('gallery-next')?.addEventListener('click', () => switchGallery((galleryIdx+1)%galleryImgs.length));

function closeProjectModal() { document.getElementById('project-detail-modal').classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('project-modal-close')?.addEventListener('click', closeProjectModal);
document.getElementById('project-modal-backdrop')?.addEventListener('click', closeProjectModal);
document.addEventListener('keydown', e => {
    const m = document.getElementById('project-detail-modal');
    if (e.key === 'Escape' && m.classList.contains('active')) { closeProjectModal(); return; }
    if (m.classList.contains('active')) {
        if (e.key === 'ArrowLeft') switchGallery((galleryIdx-1+galleryImgs.length)%galleryImgs.length);
        if (e.key === 'ArrowRight') switchGallery((galleryIdx+1)%galleryImgs.length);
    }
});

// ═══════════════════════════════════════════════
// ═══ CV DOWNLOAD ═══
// ═══════════════════════════════════════════════
function initCVButton() {
    const btn = document.getElementById('download-cv-btn');
    if (!btn) return;
    btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const cv = DataManager.getCV();
        if (cv && (cv.url || cv.data)) {
            const a = document.createElement('a'); a.href = cv.url || cv.data; a.target = '_blank'; a.download = cv.filename || 'CV.pdf'; a.click();
            showToast('Downloading CV...');
        } else showToast('CV belum diupload. Buka Admin Panel (Ctrl+Shift+A)');
    });
}

// ═══════════════════════════════════════════════
// ═══ CONTACT FORM ═══
// ═══════════════════════════════════════════════
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const btnText = btn.querySelector('.btn-text'), btnLoad = btn.querySelector('.btn-loading');
        const status = document.getElementById('form-status');
        btnText.style.display = 'none'; btnLoad.style.display = 'inline-flex'; btn.disabled = true;
        status.textContent = ''; status.className = 'form-status';
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        try {
            if (emailjsReady) {
                await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, { from_name: name, from_email: email, message, to_email: 'jayyidjiddan87@gmail.com' });
                status.textContent = '✅ Pesan berhasil dikirim!'; status.className = 'form-status success'; contactForm.reset();
            } else {
                window.open(`mailto:jayyidjiddan87@gmail.com?subject=${encodeURIComponent('Pesan dari '+name)}&body=${encodeURIComponent('Nama: '+name+'\nEmail: '+email+'\n\n'+message)}`, '_self');
                status.textContent = '📧 Membuka email...'; status.className = 'form-status success';
            }
        } catch(err) { status.textContent = '❌ Gagal mengirim. Coba via WhatsApp.'; status.className = 'form-status error'; }
        btnText.style.display = 'inline'; btnLoad.style.display = 'none'; btn.disabled = false;
        setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 6000);
    });
}
