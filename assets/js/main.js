(function () {
  'use strict';

  /* ── Marquee ── */
  const items = ['UX Design','UI Design','Motion','Brand Identity','Social Media','Video','Graphic Design'];
  const track = document.getElementById('marquee-track');
  if (track) {
    let html = '';
    for (let i = 0; i < 2; i++) {
      items.forEach(label => {
        html += `<span class="px-8 text-sm font-semibold tracking-widest text-gray-400 uppercase whitespace-nowrap">${label}</span>`;
        html += `<span style="width:6px;height:6px;border-radius:50%;background:#d1d5db;display:inline-block;flex-shrink:0;margin:0 4px;align-self:center;"></span>`;
      });
    }
    track.innerHTML = html;
  }

  /* ── Sticky nav: hidden at hero, slides in on scroll ── */
  const siteNav = document.getElementById('site-nav');
  const heroEl  = document.getElementById('hero');
  function updateNav() {
    if (!siteNav || !heroEl) return;
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    siteNav.classList.toggle('nav-visible', heroBottom < 80);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Mobile menu factory ── */
  function initMenu(toggleId, menuId, hamId, closeId) {
    const toggle = document.getElementById(toggleId);
    const menu   = document.getElementById(menuId);
    const ham    = document.getElementById(hamId);
    const close  = document.getElementById(closeId);
    if (!toggle || !menu) return;
    let open = false;
    function setOpen(v) {
      open = v;
      if (ham)   ham.classList.toggle('hidden', open);
      if (close) close.classList.toggle('hidden', !open);
      if (open) {
        menu.classList.remove('opacity-0','invisible','-translate-y-2','scale-95');
        menu.classList.add('opacity-100','visible','translate-y-0','scale-100');
      } else {
        menu.classList.add('opacity-0','invisible','-translate-y-2','scale-95');
        menu.classList.remove('opacity-100','visible','translate-y-0','scale-100');
      }
    }
    toggle.addEventListener('click', e => { e.stopPropagation(); setOpen(!open); });
    document.addEventListener('click', e => {
      if (open && !toggle.contains(e.target) && !menu.contains(e.target)) setOpen(false);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }
  initMenu('site-menu-toggle', 'site-mobile-menu', 'site-ham',  'site-close');
  initMenu('hero-menu-toggle', 'hero-mobile-menu', 'hero-ham',  'hero-close');

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  /* ── Lazy-play project card videos ──
     Only plays while scrolled into view instead of autoplaying immediately
     on load — avoids a second video competing with the hero background
     video for bandwidth/decode on page load. */
  const cardVideos = document.querySelectorAll('.project-card-video');
  if (cardVideos.length) {
    const videoIo = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.play().catch(() => {});
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    cardVideos.forEach(v => videoIo.observe(v));
  }

  /* ── Project filter ── */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectItems.forEach(item => {
        const cats = (item.dataset.category || '').split(' ');
        item.classList.toggle('hidden-item', f !== 'all' && !cats.includes(f));
      });
    });
  });

  /* ── Project card click → open URL ──────────────────────────
     HOW TO UPDATE A PROJECT LINK:
     1. Find the card in index.html
     2. Change data-url on the .project-item div:
        - External:  data-url="https://www.behance.net/gallery/your-project"
        - Internal:  data-url="projects/banking-app.html"
  ─────────────────────────────────────────────────────────── */
  projectItems.forEach(item => {
    const url = item.dataset.url;
    if (!url) return;
    const card = item.querySelector('.project-card');
    if (!card) return;
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Open project: ' + (item.dataset.title || ''));
    function openProject() {
      if (url.startsWith('http')) { window.open(url, '_blank', 'noopener,noreferrer'); }
      else { window.location.href = url; }
    }
    card.addEventListener('click', openProject);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(); }
    });
  });

  /* ── Hero cursor glow ── */
  const heroSection = document.getElementById('hero');
  const glow        = document.getElementById('hero-glow');
  if (heroSection && glow) {
    heroSection.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
    heroSection.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top  = (e.clientY - r.top)  + 'px';
    }, { passive: true });
  }

  /* ── Contact form validation + feedback ─────────────────────
     Current behavior: opens the visitor's email client via mailto:
     as a zero-backend stopgap (CONTACT_EMAIL below).

     To upgrade to a real inbox form (recommended once you have an
     endpoint — e.g. formspree.io, free, no code needed), replace
     the mailto redirect below with a fetch() call:
       fetch('https://formspree.io/f/YOUR_FORM_ID', {
         method: 'POST',
         body: new FormData(form),
         headers: { 'Accept': 'application/json' }
       }).then(r => r.ok ? showToast('Sent!', false) : showToast('Error.', true));
  ─────────────────────────────────────────────────────────── */
  const CONTACT_EMAIL = 'sofiartc02@gmail.com';
  const form     = document.getElementById('contact-form');
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  let toastTimer;

  function showToast(msg, isError) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.style.background = isError ? '#dc2626' : '#111827';
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name        = form.querySelector('#name').value.trim();
      const email       = form.querySelector('#email').value.trim();
      const message     = form.querySelector('#message').value.trim();
      const projectType = form.querySelector('#project-type').value;
      if (!name)    { showToast('Please enter your name.', true);              form.querySelector('#name').focus();    return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', true);
        form.querySelector('#email').focus(); return;
      }
      if (!message) { showToast('Please write a message.', true);              form.querySelector('#message').focus(); return; }

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Opening your email app…';

      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        projectType ? `Project type: ${projectType}` : null,
        '',
        message
      ].filter(line => line !== null).join('\n');
      const subject = encodeURIComponent(`New project inquiry from ${name}`);
      const body    = encodeURIComponent(bodyLines);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.innerHTML = 'Send message <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>';
        showToast("Opening your email app to finish sending…", false);
      }, 600);
    });
  }

})();
