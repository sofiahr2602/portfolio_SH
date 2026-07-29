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

  /* ── Floating nav: hides on scroll-down, reappears on scroll-up ── */
  const floatingNav = document.getElementById('floating-nav');
  let lastScrollY = window.scrollY;
  function updateNav() {
    if (!floatingNav) return;
    const y = window.scrollY;
    const goingDown = y > lastScrollY && y > 80;
    floatingNav.classList.toggle('nav-hidden', goingDown);
    lastScrollY = y;
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Mobile menu ── */
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
  initMenu('nav-menu-toggle', 'nav-mobile-menu', 'nav-ham', 'nav-close');

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
     on load — avoids decoding video the visitor hasn't scrolled to yet. */
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

  /* ── Projects: category sidebar ──────────────────────────────
     "All" shows only the 4 data-featured="true" cards (curated set);
     picking a category shows every project in it. On devices that
     support hover, hovering a category previews it without committing;
     click/tap always locks a category in — this covers touch devices
     and is what actually applies the filter everywhere else.
  ─────────────────────────────────────────────────────────── */
  const categoryBtns  = document.querySelectorAll('.category-item');
  const projectItems  = document.querySelectorAll('.project-item');
  const projectsGrid  = document.getElementById('projects-grid');
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // Swap which cards are shown. Also numbers the visible ones so CSS can
  // stagger them on the way back in (see --i in styles.css).
  function applyFilter(f) {
    let visible = 0;
    projectItems.forEach(item => {
      const cats = (item.dataset.category || '').split(' ');
      const show = f === 'all' ? item.dataset.featured === 'true' : cats.includes(f);
      item.classList.toggle('hidden-item', !show);
      if (show) item.style.setProperty('--i', visible++);
    });
  }

  /* Morph between categories instead of hard-swapping the contents:
     fade + lift the grid out (200ms), change what's hidden while nothing
     is visible, then let it settle back in with a per-card stagger. */
  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentFilter = null, morphTimer = null;
  function showFilter(f) {
    if (f === currentFilter) return;   // no-op re-entry (hover fires a lot)
    currentFilter = f;

    if (!projectsGrid || prefersReducedMotionQuery.matches) {
      applyFilter(f);
      return;
    }
    clearTimeout(morphTimer);
    projectsGrid.classList.add('is-morphing');
    morphTimer = setTimeout(() => {
      applyFilter(f);
      // Next frame, so the browser paints the new set at opacity 0 first
      // and actually transitions in rather than appearing instantly.
      requestAnimationFrame(() => projectsGrid.classList.remove('is-morphing'));
    }, 200);
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showFilter(btn.dataset.filter);
    });
    if (supportsHover) {
      btn.addEventListener('mouseenter', () => showFilter(btn.dataset.filter));
      btn.addEventListener('mouseleave', () => {
        const active = document.querySelector('.category-item.active');
        if (active) showFilter(active.dataset.filter);
      });
    }
  });
  showFilter('all');

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

  /* ── Hero: interactive gradient mesh ─────────────────────────
     The gradient IS the hero background — a fast, constant, ambient
     flow (see the 6-9s meshDrift keyframe in styles.css), not a cursor
     effect. The cursor nudges that flow (this rAF loop), it doesn't
     drive it — there's no separate cursor-attached spotlight anymore,
     the whole canvas is the "live" surface.

     Only `transform` is written here, so the browser composites on the
     GPU without repainting the (blurred, expensive) gradients. The
     autonomous drift lives on each layer's ::before in styles.css, so
     the two channels never fight over one property.

     Smoothing is deliberately light (0.7) and travel is large: the
     response has to read as immediate, like stirring liquid under glass.
  ─────────────────────────────────────────────────────────── */
  const heroSection   = document.getElementById('hero');
  const meshLayers    = document.querySelectorAll('[data-mesh]');
  const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSection && meshLayers.length && !reduceMotion) {
    // Per-layer [x, y] factors — opposing signs shear the colour field
    // instead of sliding it as one rigid block.
    const DRIFT = [[1, 1], [-0.78, 0.86], [0.52, -1.15]];
    const TRAVEL = 210;               // px of travel at the viewport edge
    let targetX = 0, targetY = 0, curX = 0, curY = 0, running = false;

    function tick() {
      curX += (targetX - curX) * 0.7;
      curY += (targetY - curY) * 0.7;
      meshLayers.forEach((layer, i) => {
        const [fx, fy] = DRIFT[i % DRIFT.length];
        layer.style.transform =
          `translate3d(${(curX * fx).toFixed(1)}px, ${(curY * fy).toFixed(1)}px, 0)`;
      });
      // Keep animating only while there's meaningful movement left, so an
      // idle hero isn't burning a rAF slot forever.
      if (Math.abs(targetX - curX) > 0.2 || Math.abs(targetY - curY) > 0.2) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(tick); } }

    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width  - 0.5) * TRAVEL;
      targetY = ((e.clientY - r.top)  / r.height - 0.5) * TRAVEL;
      kick();
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0; targetY = 0;
      kick();
    });
  }

  /* ── Hero: pixel-art avatar — two-frame sprite loop ─────────────
     ONE <img> element whose `src` alternates between two frames. Because
     there is only ever a single element and we never insert another one,
     duplicated or stacked sprites are structurally impossible.

       frame 1 → frame 2 → frame 1 → frame 2 …   (forever)

     Clicking doesn't change the character or spawn anything — it just
     runs the same two frames faster for a moment and blooms a glow
     (see .hero-avatar.is-excited). No float, sway, rotation or bounce.
  ─────────────────────────────────────────────────────────── */
  const avatarBtn   = document.getElementById('hero-avatar');
  const avatarFrame = document.getElementById('avatar-frame');
  const AVATAR_FRAMES = [
    'assets/images/avatar/avatar-sentada-laptop-paz.svg',   // frame 1 — ✌️ + laptop
    'assets/images/avatar/avatar-sentada-laptop-puno.svg'   // frame 2 — 👊 + laptop
  ];
  const FRAME_IDLE_MS = 720, FRAME_FAST_MS = 220, EXCITED_MS = 1400;

  if (avatarFrame) {
    let frame = 0, frameTimer = null, currentMs = FRAME_IDLE_MS, excitedTimer = null;

    function step() {
      frame = (frame + 1) % AVATAR_FRAMES.length;
      avatarFrame.src = AVATAR_FRAMES[frame];
    }
    function runAt(ms) {
      clearInterval(frameTimer);
      currentMs = ms;
      frameTimer = setInterval(step, ms);
    }

    // Both frames are heavy SVG-wrapped rasters — decode them up front so
    // the very first swap doesn't flash an empty box.
    Promise.all(AVATAR_FRAMES.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    }))).then(() => runAt(FRAME_IDLE_MS));

    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        avatarBtn.classList.add('is-excited');
        runAt(FRAME_FAST_MS);
        clearTimeout(excitedTimer);
        excitedTimer = setTimeout(() => {
          avatarBtn.classList.remove('is-excited');
          runAt(FRAME_IDLE_MS);
        }, EXCITED_MS);
      });
    }

    // Don't burn swaps while the tab is in the background.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(frameTimer);
      else runAt(currentMs);
    });
  }

  /* ── Custom pixel-art cat cursor ──────────────────────────────
     Only on devices with a real mouse (fine pointer + hover) — touch and
     hybrid coarse-pointer devices keep the native cursor untouched, since
     hiding it there would leave no visible pointer at all. The cat tracks
     the real cursor directly (no lerp) so it never feels laggy; its idle
     bounce/wag/blink run as independent CSS animations in styles.css.
  ─────────────────────────────────────────────────────────── */
  const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pixelCursor = document.getElementById('pixel-cursor');
  if (canUseCustomCursor && pixelCursor) {
    document.documentElement.classList.add('pixel-cursor-on');
    let shown = false;
    document.addEventListener('mousemove', e => {
      pixelCursor.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 18}px)`;
      if (!shown) { shown = true; pixelCursor.classList.add('active'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => pixelCursor.classList.remove('active'));
    document.addEventListener('mouseenter', () => { if (shown) pixelCursor.classList.add('active'); });
  }

})();
