const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (menu && nav) {
  const closeMenu = () => {
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  };

  const openMenu = () => {
    nav.classList.add('open');
    document.body.classList.add('menu-open');
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Close navigation');
  };

  // Keep keyboard focus inside the mobile navigation without trapping the user.
  nav.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !nav.classList.contains('open')) return;
    const items = [...nav.querySelectorAll('a')];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  menu.addEventListener('click', () => {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !menu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 850 && nav.classList.contains('open')) closeMenu();
  });
}

/* Light / dark theme with local persistence */
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;
const savedTheme = (()=>{try{return localStorage.getItem('portfolio-theme')}catch(e){return null}})();
const preferredTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
root.setAttribute('data-theme', savedTheme || preferredTheme);

function updateThemeButton() {
  if (!themeToggle) return;
  const dark = root.getAttribute('data-theme') === 'dark';
  const icon = themeToggle.querySelector('.theme-icon');
  const label = themeToggle.querySelector('.theme-label');
  if (icon) icon.textContent = dark ? '☀' : '◐';
  if (label) label.textContent = dark ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}
updateThemeButton();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{localStorage.setItem('portfolio-theme', next)}catch(e){}
    updateThemeButton();
  });
}

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), Math.min(index * 45, 180));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

const progress = document.querySelector('.progress');
if (progress) {
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === path) link.classList.add('active');
});

/* Header shadow on scroll */
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Count-up for numeric highlights */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (!target || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  let started = false;
  const run = () => {
    if (started) return; started = true;
    const t0 = performance.now(), dur = 1100;
    const tick = now => {
      const k = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { run(); o.disconnect(); } })).observe(el);
  } else run();
});

/* Cursor spotlight on cards */
const spotSel = '.feature-grid article,.experience-card,.project-card,.skill-card,.info-card,.highlight-card,.stats>div,.hero-card,.linkedin-contact,.contact-card,.cert-card,.cert-link-card';
document.querySelectorAll(spotSel).forEach(el => {
  el.classList.add('spot');
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Timeline: reveal items + glowing progress line that follows scroll */
const timelines = document.querySelectorAll('.experience-timeline');
if (timelines.length) {
  timelines.forEach(tl => tl.querySelectorAll('.experience-item:not(.reveal)').forEach(i => i.classList.add('reveal')));
  document.querySelectorAll('.experience-item.reveal').forEach(el => {
    if (!el.classList.contains('visible') && 'IntersectionObserver' in window) {
      new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { el.classList.add('visible'); o.disconnect(); } }), { threshold: .1 }).observe(el);
    } else el.classList.add('visible');
  });
  const updateTl = () => timelines.forEach(tl => {
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (window.innerHeight * 0.65 - r.top) / r.height));
    tl.style.setProperty('--p', p.toFixed(3));
  });
  window.addEventListener('scroll', updateTl, { passive: true });
  window.addEventListener('resize', updateTl);
  updateTl();
}

/* Typed hero line */
const typedEl = document.getElementById('typed');
if (typedEl) {
  const phrases = ['Building secure government integrations', 'Architecting Clean .NET 10 microservices', 'Connecting UAE PASS & Digital Vault', 'Shipping AI-powered workflows'];
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedEl.textContent = phrases[0];
  } else {
    let pi = 0, ci = phrases[0].length, del = true;
    const step = () => {
      const word = phrases[pi];
      if (del) { ci--; } else { ci++; }
      typedEl.textContent = word.slice(0, ci);
      let wait = del ? 28 : 55;
      if (!del && ci === word.length) { del = true; wait = 1800; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 350; }
      setTimeout(step, wait);
    };
    setTimeout(step, 1800);
  }
}

/* Auto-hide header: show at the top and while scrolling upward; hide while scrolling down. */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = Math.max(0, window.scrollY);
  let ticking = false;
  const threshold = 10;

  const updateHeader = () => {
    const currentY = Math.max(0, window.scrollY);
    const delta = currentY - lastY;
    const menuOpen = document.querySelector('.nav')?.classList.contains('open');

    if (currentY <= 12) {
      header.classList.remove('nav-hidden');
    } else if (!menuOpen && delta > threshold) {
      header.classList.add('nav-hidden');
    } else if (delta < -6) {
      header.classList.remove('nav-hidden');
    }

    lastY = currentY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
})();
