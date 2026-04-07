/* ===== splash.js — Splash Poster Animation & Dismiss Logic ===== */

/* Non-blocking font activation (replaces inline onload handler for CSP compliance) */
(function(){
  var link=document.getElementById('gfonts-async');
  if(link){
    if(link.sheet){link.media='all';}
    else{link.addEventListener('load',function(){link.media='all';});}
  }
})();

(function(){
  var poster=document.getElementById('splash-poster');
  if(!poster)return;
  /* Gate by auth: always keep poster until user is logged in and explicitly enters */

  var prefersReducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Floating SQL tokens — skip entirely for reduced-motion users */
  var keywords=['SELECT','FROM','WHERE','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP','JOIN','INDEX','TABLE','VIEW','TRIGGER','CURSOR','BEGIN','END','LOOP','RETURN','DECLARE','NUMBER','VARCHAR2','CLOB','BOOLEAN'];
  var tokBox=poster.querySelector('.sp-tokens');
  var tokInterval=null;
  if(!prefersReducedMotion){
    function spawnTok(){
      var el=document.createElement('span');el.className='sp-tok';
      el.textContent=keywords[Math.random()*keywords.length|0];
      el.style.left=Math.random()*100+'%';
      el.style.bottom='-30px';
      el.style.setProperty('--r',(Math.random()*20-10)+'deg');
      var dur=12+Math.random()*18;
      el.style.animationDuration=dur+'s';
      el.style.animationDelay=(Math.random()*4)+'s';
      tokBox.appendChild(el);
      setTimeout(function(){el.remove()},((dur+4)*1000));
    }
    for(var i=0;i<14;i++)setTimeout(spawnTok,i*400);
    tokInterval=setInterval(function(){spawnTok()},2200);
  }

  /* Canvas ambient glow — skip entirely for reduced-motion users */
  var cvs=poster.querySelector('.sp-canvas'),ctx=cvs.getContext('2d');
  var rafId;
  if(!prefersReducedMotion){
    var orbs=[{x:.3,y:.4,r:220,color:'rgba(37,99,235,0.08)',vx:.0002,vy:.00015},{x:.7,y:.6,r:180,color:'rgba(99,102,241,0.06)',vx:-.00018,vy:.0002},{x:.5,y:.3,r:200,color:'rgba(14,165,233,0.05)',vx:.00015,vy:-.00018}];
    function resizeCvs(){cvs.width=window.innerWidth;cvs.height=window.innerHeight}
    window.addEventListener('resize',resizeCvs);resizeCvs();
    function drawOrbs(){
      ctx.clearRect(0,0,cvs.width,cvs.height);
      for(var i=0;i<orbs.length;i++){
        var o=orbs[i];o.x+=o.vx;o.y+=o.vy;
        if(o.x<0||o.x>1)o.vx*=-1;if(o.y<0||o.y>1)o.vy*=-1;
        var g=ctx.createRadialGradient(o.x*cvs.width,o.y*cvs.height,0,o.x*cvs.width,o.y*cvs.height,o.r);
        g.addColorStop(0,o.color);g.addColorStop(1,'transparent');
        ctx.fillStyle=g;ctx.fillRect(0,0,cvs.width,cvs.height);
      }
      rafId=requestAnimationFrame(drawOrbs);
    }
    drawOrbs();
  } else {
    cvs.style.display='none';
  }

  /* Dismiss */
  function canEnterWorkbench() {
    var api = window.authApi;
    if (!api || typeof api.getUserSync !== 'function') {
      return false;
    }
    var u = api.getUserSync();
    if (!u) {
      if (typeof api.openAuthModal === 'function') {
        api.openAuthModal('请先注册/登录后再进入工作台');
      }
      return false;
    }
    return true;
  }

  function dismissSplash(){
    if(!canEnterWorkbench()) return;
    if(poster.classList.contains('leaving'))return;
    /* Force dark theme on first entry for visual continuity with poster */
    document.documentElement.setAttribute('data-theme','dark');
    localStorage.setItem('theme','dark');
    /* Sync Vue's themeMode ref */
    window.dispatchEvent(new CustomEvent('sp-theme-sync',{detail:'dark'}));
    /* Fade in the workbench — instant for reduced-motion users */
    var appEl=document.getElementById('app');
    if(prefersReducedMotion){
      if(appEl){appEl.style.opacity='1';}
      poster.style.display='none';
      document.body.classList.remove('splash-active');
      sessionStorage.setItem('sp_seen','1');
      return;
    }
    if(appEl){appEl.style.opacity='0';appEl.style.transition='opacity .6s ease .1s';requestAnimationFrame(function(){appEl.style.opacity='1'});}
    poster.classList.add('leaving');
    if(tokInterval)clearInterval(tokInterval);
    setTimeout(function(){
      poster.style.display='none';
      document.body.classList.remove('splash-active');
      if(rafId)cancelAnimationFrame(rafId);
      sessionStorage.setItem('sp_seen','1');
    },700);
  }
  /* Bind CTA button click */
  document.getElementById('sp-enter-btn').addEventListener('click',dismissSplash);
  window.addEventListener('auth:login-success', dismissSplash);

  /* Scroll hint and scroll gestures should also trigger auth gate */
  var scrollHint = poster.querySelector('.sp-scroll');
  if (scrollHint) {
    scrollHint.addEventListener('click', dismissSplash);
  }

  var wheelTriggered = false;
  poster.addEventListener('wheel', function(e) {
    if (!wheelTriggered && e.deltaY > 30) {
      wheelTriggered = true;
      dismissSplash();
      setTimeout(function() { wheelTriggered = false; }, 300);
    }
  }, { passive: true });

  var touchY = 0;
  poster.addEventListener('touchstart', function(e) {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  poster.addEventListener('touchmove', function(e) {
    if (touchY - e.touches[0].clientY > 60) {
      dismissSplash();
    }
  }, { passive: true });
})();
