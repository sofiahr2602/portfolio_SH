(function () {
  'use strict';

  const stage    = document.getElementById('toolkit-stage');
  const blob     = document.getElementById('pinata-blob');
  const replay   = document.getElementById('toolkit-replay');
  const section  = document.getElementById('toolkit');
  if (!stage || !blob || !replay || !section) return;

  const cursorCat     = document.getElementById('pixel-cursor');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Avatar reaction — ONE <img>, src swapped between two existing
     poses. Never a second element, never a clone: exactly the same
     structural guarantee as the hero avatar fix (main.js). ── */
  const avatarEl    = document.getElementById('toolkit-avatar');
  const avatarFrame = document.getElementById('toolkit-avatar-frame');
  const speechEl    = document.getElementById('toolkit-speech-bubble');
  const AVATAR_IDLE   = 'assets/images/avatar/avatar-base-sin-sonrisa.svg';
  const AVATAR_REACT  = 'assets/images/avatar/avatar-brazos-arriba.svg';
  const SPEECH_MS = 1800, AVATAR_REACT_MS = 2100;
  let avatarTimer, speechTimer;

  function avatarReact() {
    if (!avatarFrame) return;
    avatarFrame.src = AVATAR_REACT;
    if (avatarEl) avatarEl.classList.add('is-reacting');
    if (speechEl) speechEl.classList.add('visible');
    clearTimeout(speechTimer);
    clearTimeout(avatarTimer);
    speechTimer = setTimeout(() => { if (speechEl) speechEl.classList.remove('visible'); }, SPEECH_MS);
    avatarTimer = setTimeout(avatarSettle, AVATAR_REACT_MS);
  }
  function avatarSettle() {
    if (avatarFrame) avatarFrame.src = AVATAR_IDLE;
    if (avatarEl) avatarEl.classList.remove('is-reacting');
  }

  /* ── Burst / reset ──
     Click plays a brief anticipation (scale + micro shake) before the
     actual burst, so the pop reads as one satisfying beat instead of an
     abrupt swap — see .is-anticipating in styles.css. */
  const ANTICIPATE_MS = reduceMotion ? 0 : 260;
  let settleTimer, anticipateTimer;

  function burst() {
    if (stage.classList.contains('is-burst') || stage.classList.contains('is-anticipating')) return;
    stage.classList.add('is-anticipating');
    clearTimeout(anticipateTimer);
    anticipateTimer = setTimeout(() => {
      stage.classList.remove('is-anticipating');
      stage.classList.add('is-burst');
      avatarReact();
      clearTimeout(settleTimer);
      const settleDelay = reduceMotion ? 250 : 1300;
      settleTimer = setTimeout(() => replay.classList.add('visible'), settleDelay);
    }, ANTICIPATE_MS);
  }
  function reset() {
    stage.classList.remove('is-burst', 'is-anticipating');
    replay.classList.remove('visible');
    clearTimeout(settleTimer);
    clearTimeout(anticipateTimer);
    clearTimeout(avatarTimer);
    clearTimeout(speechTimer);
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
