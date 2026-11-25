(function () {
  'use strict';
  var root = document.documentElement;
  var query = new URLSearchParams(location.search);
  var theme = query.get('theme');
  try { if (theme !== 'light' && theme !== 'dark') theme = localStorage.getItem('zaura.theme'); } catch (_) { }
  var media = matchMedia('(prefers-color-scheme: dark)');
  function apply(value) {
    root.dataset.theme = value;
    document.querySelectorAll('[data-theme-switch]').forEach(function (control) { control.value = value; });
  }
  apply(theme === 'light' || theme === 'dark' ? theme : media.matches ? 'dark' : 'light');
  document.querySelectorAll('[data-theme-switch]').forEach(function (control) {
    control.addEventListener('change', function () {
      theme = control.value === 'dark' ? 'dark' : 'light'; apply(theme);
      try { localStorage.setItem('zaura.theme', theme); } catch (_) { }
      try { var current = new URL(location.href); current.searchParams.set('theme', theme); history.replaceState(null, '', current.href); } catch (_) { }
    });
  });
  media.addEventListener('change', function (event) { if (theme !== 'light' && theme !== 'dark') apply(event.matches ? 'dark' : 'light'); });
  // Language remains a real static link and works without JavaScript. Carry only the
  // appearance enum, never the current URL/query or any authorization capability.
  document.querySelectorAll('[data-language-link]').forEach(function (link) {
    link.addEventListener('click', function () { var url = new URL(link.href); url.searchParams.set('theme', root.dataset.theme); link.href = url.href; });
  });
})();
