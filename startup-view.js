(function () {
  var KEY = 'sqldev_last_view';
  var root = document.documentElement;
  function resolveTheme(mode) {
    if (mode === 'dark' || mode === 'light') return mode;
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_err) {
      return 'light';
    }
  }
  try {
    var savedTheme = localStorage.getItem('theme') || 'system';
    root.setAttribute('data-theme', resolveTheme(savedTheme));
    if (window.localStorage && localStorage.getItem(KEY) === 'workbench') {
      root.classList.add('startup-workbench');
      window.__SQDEV_STARTUP_VIEW = 'workbench';
      return;
    }
  } catch (_err) {}
  if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'light');
  window.__SQDEV_STARTUP_VIEW = 'splash';
})();
