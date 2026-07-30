(function () {
  'use strict';

  const stage    = document.getElementById('toolkit-stage');
  const blob     = document.getElementById('pinata-blob');
  const replay   = document.getElementById('toolkit-replay');
  const section  = document.getElementById('toolkit');
  if (!stage || !blob || !replay || !section) return;

  const cursorCat     = document.getElementById('pixel-cursor');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pause the piñata float/morph + avatar breathe keyframes once this
  // section scrolls out of view — see #toolkit-stage.is-offscreen in
  // styles.css. They run forever otherwise, even far down the page.
  new IntersectionObserver(entries => {
    stage.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    if (!entries[0].isIntersecting) stopIdle();
    else if (!reacting) runIdle();
  }).observe(stage);

  /* ── Avatar reaction — ONE <img>, src swapped between two existing
     poses. Never a second element, never a clone: exactly the same
     structural guarantee as the hero avatar fix (main.js). ── */
  const avatarEl    = document.getElementById('toolkit-avatar');
  const avatarFrame = document.getElementById('toolkit-avatar-frame');
  const speechEl    = document.getElementById('toolkit-speech-bubble');
  const AVATAR_REACT  = 'assets/images/avatar/avatar-brazos-arriba.webp';

  /* Pre-burst idle: a two-frame loop ("Pointed frame 1/2") that never
     stops, same mechanism as the hero avatar (main.js) — it's an
     invitation to click the piñata, so it should always be moving, not
     a single static pose. This only ever plays BEFORE the burst; once
     .is-reacting is on (avatarReact, below), the loop is stopped and
     this code never touches the avatar again until reset(). */
  const IDLE_FRAMES = [
    'assets/images/avatar/avatar-pointed-1.webp',
    'assets/images/avatar/avatar-pointed-2.webp'
  ];
  const IDLE_MS = 720;
  let idleFrame = 0, idleTimer = null, reacting = false;

  // Live Image() copies kept around (not discarded after preload) so
  // `.decode()` can run again on every swap — see the identical fix in
  // main.js's hero avatar loop for why: without re-decoding the offscreen
  // copy first, a `src` swap on the visible <img> can force a decode on
  // the visible element itself and show nothing for a frame.
  const idleImages = IDLE_FRAMES.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });
  function idleStep() {
    const next = (idleFrame + 1) % IDLE_FRAMES.length;
    const swap = () => { idleFrame = next; if (avatarFrame) avatarFrame.src = IDLE_FRAMES[next]; };
    const img = idleImages[next];
    if (img.decode) img.decode().then(swap, swap);
    else swap();
  }
  function runIdle() {
    if (reacting || reduceMotion) return;
    clearInterval(idleTimer);
    idleTimer = setInterval(idleStep, IDLE_MS);
  }
  function stopIdle() {
    clearInterval(idleTimer);
  }

  // Preload + decode both idle frames so the very first swap doesn't
  // flash empty.
  Promise.all(idleImages.map(img => new Promise(resolve => {
    if (img.decode) img.decode().then(resolve, resolve);
    else { img.onload = img.onerror = resolve; }
  }))).then(() => {
    idleFrame = 0;
    if (avatarFrame) avatarFrame.src = IDLE_FRAMES[0];
    runIdle();
  });

  // Don't burn swaps while the tab is in the background (mirrors the
  // hero avatar's same guard in main.js).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopIdle();
    else if (!reacting) runIdle();
  });

  // Both the raised-hands pose and the "CHAAA!" bubble now hold until the
  // user clicks "Break again" (reset()) — no auto-revert timer. Previously
  // this settled back to idle on its own after ~2s, which read as the
  // avatar "giving up" on the reaction while the tools were still out.
  function avatarReact() {
    reacting = true;
    stopIdle();
    if (!avatarFrame) return;
    avatarFrame.src = AVATAR_REACT;
    if (avatarEl) avatarEl.classList.add('is-reacting');
    if (speechEl) speechEl.classList.add('visible');
  }
  function avatarSettle() {
    reacting = false;
    idleFrame = 0;
    if (avatarFrame) avatarFrame.src = IDLE_FRAMES[0];
    if (avatarEl) avatarEl.classList.remove('is-reacting');
    runIdle();
  }

  /* ── Burst / reset ──
     Click plays a brief anticipation (scale + micro shake) before the
     actual burst, so the pop reads as one satisfying beat instead of an
     abrupt swap — see .is-anticipating in styles.css. */
  const ANTICIPATE_MS = reduceMotion ? 0 : 260;
  // Longest particle drop finishes at its --delay (0.665s, the last
  // lollipop) + the pinataDrop animation duration (0.85s, see styles.css)
  // — this is when the idle side-to-side bounce should take over on the
  // badges. Keep this in sync with the slowest --delay in index.html.
  const SETTLE_MS = reduceMotion ? 250 : 1520;
  let settleTimer, bounceTimer, anticipateTimer;

  function burst() {
    if (stage.classList.contains('is-burst') || stage.classList.contains('is-anticipating')) return;
    stage.classList.add('is-anticipating');
    clearTimeout(anticipateTimer);
    anticipateTimer = setTimeout(() => {
      stage.classList.remove('is-anticipating');
      stage.classList.add('is-burst');
      avatarReact();
      clearTimeout(settleTimer);
      clearTimeout(bounceTimer);
      settleTimer = setTimeout(() => replay.classList.add('visible'), SETTLE_MS);
      bounceTimer = setTimeout(() => stage.classList.add('is-settled'), SETTLE_MS);
    }, ANTICIPATE_MS);
  }
  function reset() {
    stage.classList.remove('is-burst', 'is-anticipating', 'is-settled');
    replay.classList.remove('visible');
    clearTimeout(settleTimer);
    clearTimeout(bounceTimer);
    clearTimeout(anticipateTimer);
    if (speechEl) speechEl.classList.remove('visible');
    avatarSettle();
  }
  blob.addEventListener('click', e => {
    burst();
    clawSwipe(e.clientX, e.clientY);
  });
  replay.addEventListener('click', reset);

  /* ── Cat-cursor claw swipe — only visible if the custom cursor is
     active (hero's toolkit tie-in); the burst itself never depends on
     this, so touch/keyboard activation still works fully without it. ── */
  let clawTimer;
  function clawSwipe(x, y) {
    if (!cursorCat || reduceMotion) return;
    clearTimeout(clawTimer);
    cursorCat.classList.add('claw-swipe');
    clawTimer = setTimeout(() => cursorCat.classList.remove('claw-swipe'), 350);
    spawnClawMarks(x, y);
  }
  function spawnClawMarks(x, y) {
    const angles = [-30, 0, 28];
    angles.forEach((angle, i) => {
      const mark = document.createElement('span');
      mark.className = 'claw-mark';
      mark.style.left = (x - 23 + i * 6) + 'px';
      mark.style.top  = (y - 2 + i * 9) + 'px';
      mark.style.setProperty('--mark-rot', angle + 'deg');
      document.body.appendChild(mark);
      mark.addEventListener('animationend', () => mark.remove());
      setTimeout(() => mark.remove(), 600); // fallback if animationend doesn't fire
    });
  }

  /* ── Blob glow reacts to cursor proximity ── */
  if (!reduceMotion) {
    section.addEventListener('mousemove', e => {
      const r = blob.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const proximity = Math.max(0, 1 - dist / 280);
      stage.style.setProperty('--proximity', (0.25 + proximity * 0.55).toFixed(2));
    }, { passive: true });
    section.addEventListener('mouseleave', () => stage.style.setProperty('--proximity', '0.25'));
  }

})();
