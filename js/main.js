// ============================================================
// 主渲染引擎 — 读取 content.js 并渲染页面
// ============================================================

(function() {
  'use strict';

  const C = SITE_CONTENT;

  // ---- 背景光斑粒子 ----
  function initBokeh() {
    const canvas = document.getElementById('bokeh');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const maxP = 55;
    let w, h;

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    class Dot {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = init ? Math.random() * w : (Math.random() > 0.5 ? 0 : w);
        this.y = init ? Math.random() * h : Math.random() * h;
        this.r = Math.random() * 2.2 + 0.8;
        this.a = Math.random() * 0.3 + 0.04;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.da = Math.random() * 0.015 + 0.003;
        this.dir = Math.random() > 0.5 ? 1 : -1;
        this.hue = Math.random() > 0.55 ? '140,110,210' : '200,155,115';
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.a += this.da * this.dir;
        if (this.a > 0.4) this.dir = -1;
        if (this.a < 0.03) this.dir = 1;
        if (this.x < -15 || this.x > w + 15 || this.y < -15 || this.y > h + 15) this.reset(false);
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.hue},${this.a})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < maxP; i++) particles.push(new Dot());

    (function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      requestAnimationFrame(animate);
    })();
  }

  function getVal(path) {
    return path.split('.').reduce((o, k) => (o || {})[k], C) || '';
  }

  // ---- 导航 ----
  function renderNav() {
    const logo = document.querySelector('.nav-logo');
    if (logo) logo.textContent = C.nav.logo;
    document.querySelectorAll('.nav-links a').forEach(a => {
      const key = a.getAttribute('data-content');
      if (key) a.textContent = getVal(key);
    });
  }

  // ---- Hero ----
  function renderHero() {
    document.querySelectorAll('[data-content^="hero."]').forEach(el => {
      el.textContent = getVal(el.getAttribute('data-content'));
    });
  }

  // ---- 关于我 ----
  function renderAbout() {
    const textDiv = document.querySelector('[data-content="about.paragraphs"]');
    if (textDiv) {
      textDiv.innerHTML = C.about.paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    const statsDiv = document.querySelector('[data-content="about.stats"]');
    if (statsDiv && C.about.stats) {
      statsDiv.innerHTML = C.about.stats.map(s => `
        <div class="about-stat">
          <div class="stat-num">${s.num}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');
    }
  }

  // ---- 能力矩阵 ----
  function renderSkills() {
    const container = document.querySelector('[data-content="skills.items"]');
    if (!container) return;
    container.innerHTML = C.skills.items.map((item, i) => `
      <div class="skill-row">
        <div class="skill-number">0${i + 1}</div>
        <div class="skill-card-new">
          <div class="skill-header">
            <span class="skill-icon">${item.icon}</span>
            <span class="skill-name">${item.title}</span>
            <span class="skill-jd-tag">${item.jd}</span>
          </div>
          <p class="skill-desc">${item.desc}</p>
          <div class="skill-proof">${item.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  }

  // ---- 作品集 ----
  function renderPortfolio() {
    const grid = document.querySelector('[data-content="portfolio.items"]');
    if (!grid) return;
    grid.innerHTML = C.portfolio.items.map((item, i) => {
      const isFeatured = item.featured;
      return `
      <a href="${item.file}" class="work-card${isFeatured ? ' work-featured' : ''}">
        <div class="work-cover">${item.cover}</div>
        <h3>${item.title}</h3>
        <p class="work-summary">${item.summary}</p>
        <div class="work-tags">${item.tags.map(t => `<span>${t}</span>`).join('')}</div>
      </a>`;
    }).join('');
  }

  // ---- 简历 ----
  function renderResume() {
    const wrapper = document.querySelector('[data-content="resume"]');
    if (!wrapper) return;
    const R = C.resume;
    wrapper.innerHTML = `
      <div class="resume-header">
        <div>
          <div class="resume-name">${R.personal.name}</div>
          <div class="resume-job">${R.personal.jobTarget}</div>
        </div>
        <div class="resume-info-grid">
          <span>${R.personal.gender} · ${R.personal.age}</span>
          <span>${R.personal.graduate}</span>
          <span>${R.personal.degree} · ${R.personal.major}</span>
          <span>📱 ${R.personal.phone}</span>
          <span>📧 ${R.personal.email}</span>
        </div>
      </div>
      <div class="resume-section">
        <h4>${R.experience.heading}</h4>
        <div class="resume-company">${R.experience.company}</div>
        <div class="resume-role">${R.experience.role}</div>
        <ul>${R.experience.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
      <div class="resume-section">
        <h4>${R.other.heading}</h4>
        <ul>${R.other.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
      <div class="resume-section">
        <h4>${R.evaluation.heading}</h4>
        <ul>${R.evaluation.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
    `;
  }

  // ---- 联系 ----
  function renderContact() {
    const wrapper = document.querySelector('[data-content="contact"]');
    if (!wrapper) return;
    const CT = C.contact;
    wrapper.innerHTML = `
      <div class="contact-items">
        <div class="contact-item">📱 ${CT.phone}</div>
        <div class="contact-item">📧 ${CT.email}</div>
      </div>
      <p class="contact-closing">${CT.closing}</p>
    `;
  }

  // ---- Footer ----
  function renderFooter() {
    const footer = document.querySelector('footer[data-content="footer"]');
    if (footer) footer.textContent = C.footer;
  }

  function renderAll() {
    renderNav();
    renderHero();
    renderAbout();
    renderSkills();
    renderPortfolio();
    renderResume();
    renderContact();
    renderFooter();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBokeh();
    renderAll();
  });

  window.__renderAll = renderAll;
  window.__SITE_CONTENT = C;
})();
