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

/* Clean URLs: show /about instead of /about.html, and mark the current page */
const cleanPath = p => p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '').replace(/(.)\/+$/, '$1') || '/';
if (location.protocol.startsWith('http') && /\.html$/.test(location.pathname)) {
  history.replaceState(null, '', cleanPath(location.pathname) + location.search + location.hash);
}
const currentPath = cleanPath(location.pathname);
document.querySelectorAll('.nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && !href.startsWith('http') && cleanPath(href) === currentPath) link.classList.add('active');
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
  const phrases = ['Building secure government integrations', 'Architecting clean .NET APIs', 'Connecting UAE PASS & Digital Vault', 'Shipping AI-powered workflows'];
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

/* Compact navbar
   - Top of the page: the full bar.
   - Scrolling down: it becomes a photo + name pill, which hides while you keep scrolling down.
   - Scrolling up: the pill slides back in.
   - Desktop: hovering the pill (mouse) or tabbing into it (keyboard) expands the full navigation.
   - Mobile: the menu button opens the dropdown. */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const nav = header.querySelector('.nav');
  const ON = 90, OFF = 30, DOWN = 6, UP = 3;
  let compact = false, hidden = false, lastY = Math.max(0, window.scrollY), ticking = false;

  const busy = () =>
    header.classList.contains('is-hover') || header.classList.contains('is-kbd') ||
    header.classList.contains('is-open') || nav?.classList.contains('open');

  const setCompact = state => {
    if (state === compact) return;
    const wasSticky = getComputedStyle(header).position === 'sticky';
    const h = header.offsetHeight;
    compact = state;
    header.classList.toggle('is-compact', state);
    // The sticky bar leaves the page flow when it becomes a floating pill: hold its space so content does not jump.
    document.body.style.paddingTop = state && wasSticky ? h + 'px' : '';
    if (!state) { setHidden(false); header.classList.remove('is-open', 'is-hover', 'is-kbd'); }
  };
  const setHidden = state => {
    if (state === hidden) return;
    hidden = state;
    header.classList.toggle('pill-hidden', state);
    if (state) {
      header.classList.remove('is-open', 'is-hover', 'is-kbd');
      if (header.contains(document.activeElement)) document.activeElement.blur();
    }
  };

  const update = () => {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    if (y > ON) {
      setCompact(true);
      if (!busy()) {
        if (delta > DOWN) setHidden(true);
        else if (delta < -UP) setHidden(false);
      }
    } else if (y < OFF && !nav?.classList.contains('open')) {
      setCompact(false);
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => { if (compact) { setCompact(false); update(); } });

  // Mouse hover expands the pill (touch taps do not leave it stuck open).
  header.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') header.classList.add('is-hover'); });
  header.addEventListener('pointerleave', () => header.classList.remove('is-hover'));
  // Keyboard focus expands it; mouse focus (e.g. after clicking the theme button) does not.
  header.addEventListener('focusin', e => {
    try { if (e.target.matches(':focus-visible')) header.classList.add('is-kbd'); } catch (_) { header.classList.add('is-kbd'); }
  });
  header.addEventListener('focusout', () => setTimeout(() => {
    if (!header.contains(document.activeElement)) header.classList.remove('is-kbd');
  }, 0));
  // Touch: tapping the pill background toggles the full navigation.
  header.addEventListener('click', e => {
    if (!compact || e.target.closest('a, button')) return;
    header.classList.toggle('is-open');
  });
  document.addEventListener('click', e => {
    if (compact && !header.contains(e.target)) header.classList.remove('is-open');
  });
  // After a mouse click on the theme button, release focus so the pill collapses normally.
  header.querySelector('.theme-toggle')?.addEventListener('click', e => {
    if (e.detail > 0) { e.currentTarget.blur(); header.classList.remove('is-kbd', 'is-open'); }
  });
  update();
})();

/* Navigation: a sliding highlight follows the hovered link and settles on the current page.
   The current page's previous position is remembered, so the highlight glides from the old page to the new one. */
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  if (!links.length) return;
  const ind = document.createElement('span');
  ind.className = 'nav-indicator';
  ind.setAttribute('aria-hidden', 'true');
  nav.prepend(ind);
  links.forEach((a, i) => a.style.setProperty('--i', i));
  const active = nav.querySelector('a.active');
  let target = active;

  const place = (el, instant) => {
    target = el;
    if (!el || !el.offsetWidth) { ind.classList.remove('on'); return; }
    if (instant) ind.classList.add('no-anim');
    ind.style.setProperty('--x', el.offsetLeft + 'px');
    ind.style.setProperty('--y', el.offsetTop + 'px');
    ind.style.setProperty('--w', el.offsetWidth + 'px');
    ind.style.setProperty('--h', el.offsetHeight + 'px');
    ind.classList.add('on');
    if (instant) { void ind.offsetWidth; ind.classList.remove('no-anim'); }
  };
  const rest = () => place(active);
  links.forEach(a => {
    a.addEventListener('mouseenter', () => { nav.classList.add('is-hovering'); place(a); });
    a.addEventListener('focus', () => place(a));
    a.addEventListener('blur', rest);
  });
  nav.addEventListener('mouseleave', () => { nav.classList.remove('is-hovering'); rest(); });

  const hrefOf = a => cleanPath(a.getAttribute('href') || '');
  let from = null;
  try { from = sessionStorage.getItem('navFrom'); } catch (_) {}
  const fromEl = from ? links.find(l => hrefOf(l) === from) : null;
  if (active && fromEl && fromEl !== active && nav.offsetWidth) {
    place(fromEl, true);
    requestAnimationFrame(() => requestAnimationFrame(() => place(active)));
  } else {
    place(active, true);
  }
  try { sessionStorage.setItem('navFrom', active ? hrefOf(active) : ''); } catch (_) {}

  // Keep the highlight correct when the nav changes size (menu opens, pill expands, window resizes, fonts load).
  if ('ResizeObserver' in window) new ResizeObserver(() => place(target, true)).observe(nav);
  window.addEventListener('resize', () => place(target, true));
  if (document.fonts?.ready) document.fonts.ready.then(() => place(target, true));

  // Names fade in one after another on load.
  if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    nav.classList.add('intro');
    setTimeout(() => nav.classList.remove('intro'), 1400);
  }
})();

/* Hero card: subtle 3D tilt on pointer devices */
(() => {
  const card = document.querySelector('.hero-card.hc');
  if (!card || !window.matchMedia) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
    card.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
})();

/* Accessibility: mark the current page in the navigation */
document.querySelectorAll('.nav a.active').forEach(a => a.setAttribute('aria-current', 'page'));

/* Back-to-top button */
(() => {
  const btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);
  const toggle = () => btn.classList.toggle('show', window.scrollY > 700);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();
