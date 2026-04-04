/* ===== splash.js — Splash Poster Animation & Dismiss Logic ===== */
(function(){
  var poster=document.getElementById('splash-poster');
  if(!poster)return;
  if(sessionStorage.getItem('sp_seen')){poster.style.display='none';document.body.classList.remove('splash-active');return}

  /* Floating SQL tokens */
  var keywords=['SELECT','FROM','WHERE','INSERT','UPDATE','DELETE','CREATE','ALTER','DROP','JOIN','INDEX','TABLE','VIEW','TRIGGER','CURSOR','BEGIN','END','LOOP','RETURN','DECLARE','NUMBER','VARCHAR2','CLOB','BOOLEAN'];
  var tokBox=poster.querySelector('.sp-tokens');
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
  var tokInterval=setInterval(function(){spawnTok()},2200);

  /* Canvas ambient glow */
  var cvs=poster.querySelector('.sp-canvas'),ctx=cvs.getContext('2d');
  var orbs=[{x:.3,y:.4,r:220,color:'rgba(37,99,235,0.08)',vx:.0002,vy:.00015},{x:.7,y:.6,r:180,color:'rgba(99,102,241,0.06)',vx:-.00018,vy:.0002},{x:.5,y:.3,r:200,color:'rgba(14,165,233,0.05)',vx:.00015,vy:-.00018}];
  var rafId;
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

  /* Dismiss */
  function dismissSplash(){
    if(poster.classList.contains('leaving'))return;
    /* Force dark theme on first entry for visual continuity with poster */
    document.documentElement.setAttribute('data-theme','dark');
    localStorage.setItem('theme','dark');
    /* Sync Vue's themeMode ref */
    window.dispatchEvent(new CustomEvent('sp-theme-sync',{detail:'dark'}));
    /* Fade in the workbench */
    var appEl=document.getElementById('app');
    if(appEl){appEl.style.opacity='0';appEl.style.transition='opacity .6s ease .1s';requestAnimationFrame(function(){appEl.style.opacity='1'});}
    poster.classList.add('leaving');
    clearInterval(tokInterval);
    setTimeout(function(){
      poster.style.display='none';
      document.body.classList.remove('splash-active');
      cancelAnimationFrame(rafId);
      sessionStorage.setItem('sp_seen','1');
    },700);
  }
  /* Bind CTA button click */
  document.getElementById('sp-enter-btn').addEventListener('click',dismissSplash);
  /* Bind scroll hint click */
  poster.querySelector('.sp-scroll').addEventListener('click',dismissSplash);
  /* Dismiss on mouse wheel or touch swipe up */
  var wheelFired=false;
  poster.addEventListener('wheel',function(e){if(!wheelFired&&e.deltaY>30){wheelFired=true;dismissSplash();}},{passive:true});
  var touchY=0;
  poster.addEventListener('touchstart',function(e){touchY=e.touches[0].clientY;},{passive:true});
  poster.addEventListener('touchmove',function(e){if(touchY-e.touches[0].clientY>60)dismissSplash();},{passive:true});
})();
