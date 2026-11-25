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
    document.querySelectorAll('[data-theme-choice]').forEach(function (control) {
      var selected = control.dataset.themeChoice === value;
      control.setAttribute('aria-checked', selected ? 'true' : 'false');
      control.tabIndex = selected ? 0 : -1;
      control.disabled = false;
    });
  }
  function choose(value) {
    if (value !== 'light' && value !== 'dark') return;
    theme = value; apply(theme);
    try { localStorage.setItem('zaura.theme', theme); } catch (_) { }
    try { var current = new URL(location.href); current.searchParams.set('theme', theme); history.replaceState(null, '', current.href); } catch (_) { }
  }
  apply(theme === 'light' || theme === 'dark' ? theme : media.matches ? 'dark' : 'light');
  document.querySelectorAll('[data-theme-switch]').forEach(function (control) {
    control.addEventListener('change', function () {
      choose(control.value);
    });
  });
  document.querySelectorAll('[data-theme-picker]').forEach(function (picker) {
    var choices = Array.from(picker.querySelectorAll('[data-theme-choice]'));
    choices.forEach(function (control, index) {
      control.addEventListener('click', function () { choose(control.dataset.themeChoice); });
      control.addEventListener('keydown', function (event) {
        var next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + choices.length - 1) % choices.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = choices.length - 1;
        else return; // Enter/Space keep the native button activation behavior.
        event.preventDefault();
        choose(choices[next].dataset.themeChoice);
        choices[next].focus();
      });
    });
  });
  media.addEventListener('change', function (event) { if (theme !== 'light' && theme !== 'dark') apply(event.matches ? 'dark' : 'light'); });
  // Language remains a real static link and works without JavaScript. Carry only the
  // appearance enum, never the current URL/query or any authorization capability.
  document.querySelectorAll('[data-language-link]').forEach(function (link) {
    link.addEventListener('click', function () { var url = new URL(link.href); url.searchParams.set('theme', root.dataset.theme); link.href = url.href; });
  });
})();
