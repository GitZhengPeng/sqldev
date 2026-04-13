(function () {
  var FONT_ID = 'async-noto-sans-sc';
  var FONT_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';

  function loadNotoSansSc() {
    if (document.getElementById(FONT_ID)) return;
    var link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadNotoSansSc, { timeout: 1200 });
  } else {
    window.setTimeout(loadNotoSansSc, 0);
  }
})();
