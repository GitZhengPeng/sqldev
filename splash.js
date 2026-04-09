/* ===== splash.js — Splash Motion & Workbench Scrolling ===== */

/* Non-blocking font activation (replaces inline onload handler for CSP compliance) */
(function () {
  var link = document.getElementById('gfonts-async');
  if (!link) return;
  if (link.sheet) link.media = 'all';
  else link.addEventListener('load', function () { link.media = 'all'; });
})();

(function () {
  var poster = document.getElementById('splash-poster');
  if (!poster) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var workbench = document.getElementById('main-content');
  var scrollHint = poster.querySelector('.sp-scroll');
  var transitionHint = document.getElementById('sp-transition');
  var enterBtn = document.getElementById('sp-enter-btn');

  function scrollToWorkbench() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    window.dispatchEvent(new CustomEvent('sp-theme-sync', { detail: 'dark' }));
    if (workbench && typeof workbench.scrollIntoView === 'function') {
      workbench.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function showSplashHome() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  window.splashApi = Object.assign({}, window.splashApi || {}, {
    showHome: showSplashHome,
    enterWorkbench: scrollToWorkbench
  });

  /* Floating SQL tokens */
  var keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'JOIN', 'INDEX', 'TABLE', 'VIEW', 'TRIGGER', 'CURSOR', 'BEGIN', 'END', 'RETURN', 'DECLARE', 'NUMBER', 'VARCHAR2', 'CLOB', 'BOOLEAN'];
  var tokBox = poster.querySelector('.sp-tokens');
  if (tokBox && !prefersReducedMotion) {
    function spawnTok() {
      var el = document.createElement('span');
      el.className = 'sp-tok';
      el.textContent = keywords[Math.random() * keywords.length | 0];
      el.style.left = Math.random() * 100 + '%';
      el.style.bottom = '-30px';
      el.style.setProperty('--r', (Math.random() * 20 - 10) + 'deg');
      var dur = 12 + Math.random() * 16;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random() * 4) + 's';
      tokBox.appendChild(el);
      setTimeout(function () { el.remove(); }, (dur + 4) * 1000);
    }
    for (var i = 0; i < 12; i++) setTimeout(spawnTok, i * 380);
    setInterval(spawnTok, 2200);
  }

  /* Canvas ambient glow */
  var cvs = poster.querySelector('.sp-canvas');
  var ctx = cvs && cvs.getContext ? cvs.getContext('2d') : null;
  if (ctx && !prefersReducedMotion) {
    var orbs = [
      { x: .24, y: .18, r: 280, color: 'rgba(79,125,249,0.11)', vx: .00016, vy: .00013 },
      { x: .78, y: .24, r: 220, color: 'rgba(139,92,246,0.09)', vx: -.00014, vy: .00017 },
      { x: .54, y: .48, r: 180, color: 'rgba(34,211,238,0.06)', vx: .00012, vy: -.0001 }
    ];
    function resizeCanvas() {
      cvs.width = window.innerWidth;
      cvs.height = Math.max(window.innerHeight, poster.offsetHeight);
    }
    function drawOrbs() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (var i = 0; i < orbs.length; i++) {
        var o = orbs[i];
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < 0 || o.x > 1) o.vx *= -1;
        if (o.y < 0 || o.y > 1) o.vy *= -1;
        var g = ctx.createRadialGradient(o.x * cvs.width, o.y * cvs.height, 0, o.x * cvs.width, o.y * cvs.height, o.r);
        g.addColorStop(0, o.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cvs.width, cvs.height);
      }
      requestAnimationFrame(drawOrbs);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawOrbs();
  } else if (cvs) {
    cvs.style.display = 'none';
  }

  if (enterBtn) enterBtn.addEventListener('click', scrollToWorkbench);
  if (scrollHint) scrollHint.addEventListener('click', scrollToWorkbench);
  if (transitionHint) transitionHint.addEventListener('click', scrollToWorkbench);
  window.addEventListener('auth:login-success', scrollToWorkbench);
})();
