/* Standalone accessibility controls. Include this file with <script defer>. */
(function () {
  'use strict';

  function init() {
    if (document.getElementById('accessibility-widget')) return;

    var key = 'accessibility-widget-settings';
    var scales = [100, 125, 150, 175, 200];
    var defaults = { scale: 100, contrast: false, links: false, motion: false };
    var settings = Object.assign({}, defaults);

    try {
      var saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved && typeof saved === 'object') {
        if (scales.indexOf(saved.scale) !== -1) settings.scale = saved.scale;
        ['contrast', 'links', 'motion'].forEach(function (name) {
          if (typeof saved[name] === 'boolean') settings[name] = saved[name];
        });
      }
    } catch (error) {
      // The widget still works if storage is unavailable or contains invalid data.
    }

    var pageStyles = document.createElement('style');
    pageStyles.textContent = [
      'html[data-a11y-scale="125"] body { zoom: 1.25 !important; }',
      'html[data-a11y-scale="150"] body { zoom: 1.5 !important; }',
      'html[data-a11y-scale="175"] body { zoom: 1.75 !important; }',
      'html[data-a11y-scale="200"] body { zoom: 2 !important; }',
      'html[data-a11y-contrast] body { filter: contrast(1.5) !important; }',
      'html[data-a11y-links] body a { text-decoration: underline !important; }',
      'html[data-a11y-motion] body *, html[data-a11y-motion] body *::before, html[data-a11y-motion] body *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }',
      'html[data-a11y-motion], html[data-a11y-motion] body { scroll-behavior: auto !important; }'
    ].join('\n');
    document.head.appendChild(pageStyles);

    // Keep the controls outside the body so page zoom and filters do not affect them.
    var host = document.createElement('div');
    host.id = 'accessibility-widget';
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' +
      ':host { all: initial; position: fixed; right: 20px; bottom: 20px; z-index: 2147483647; font-family: Arial, sans-serif; color: #172033; }' +
      '*, *::before, *::after { box-sizing: border-box; }' +
      'button { font: inherit; cursor: pointer; }' +
      'button:focus-visible { outline: 3px solid #ffbf47; outline-offset: 3px; }' +
      '.launcher { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; margin-left: auto; border: 2px solid white; border-radius: 50%; color: white; background: #1648a5; box-shadow: 0 4px 16px #0005; }' +
      '.launcher:hover { background: #10377e; }' +
      '.panel { width: min(320px, calc(100vw - 32px)); max-height: calc(100vh - 100px); overflow: auto; margin-bottom: 12px; padding: 18px; background: #fff; border: 1px solid #b9c2d2; border-radius: 12px; box-shadow: 0 6px 24px #0004; font-size: 16px; line-height: 1.4; }' +
      '[hidden] { display: none !important; }' +
      '.heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }' +
      'h2 { margin: 0; font-size: 20px; line-height: 1.2; }' +
      '.close { width: 36px; height: 36px; border: 0; border-radius: 6px; background: #edf1f7; color: #172033; font-size: 24px; line-height: 1; }' +
      '.scale-label { margin: 0 0 8px; font-weight: bold; }' +
      '.scale { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: 8px; margin-bottom: 12px; text-align: center; }' +
      '.scale button { height: 40px; border: 1px solid #73809a; border-radius: 6px; background: white; color: #172033; font-size: 22px; }' +
      'button:disabled { opacity: .45; cursor: default; }' +
      '.option, .reset { width: 100%; min-height: 44px; margin-top: 8px; padding: 9px 12px; border: 1px solid #73809a; border-radius: 6px; background: white; color: #172033; text-align: left; }' +
      '.option[aria-pressed="true"] { background: #e5edff; border-color: #1648a5; color: #10377e; font-weight: bold; }' +
      '.option span { float: right; }' +
      '.reset { text-align: center; color: #10377e; font-weight: bold; }' +
      '@media (max-width: 480px) { :host { right: 16px; bottom: 16px; } }' +
      '</style>' +
      '<section class="panel" id="a11y-panel" aria-labelledby="a11y-title" hidden>' +
      '<div class="heading"><h2 id="a11y-title">Доступность</h2><button class="close" type="button" aria-label="Закрыть настройки">×</button></div>' +
      '<p class="scale-label">Масштаб страницы</p>' +
      '<div class="scale"><button type="button" data-action="smaller" aria-label="Уменьшить масштаб">−</button><output aria-live="polite"></output><button type="button" data-action="larger" aria-label="Увеличить масштаб">+</button></div>' +
      '<button class="option" type="button" data-action="contrast">Усилить контраст <span aria-hidden="true"></span></button>' +
      '<button class="option" type="button" data-action="links">Подчеркнуть ссылки <span aria-hidden="true"></span></button>' +
      '<button class="option" type="button" data-action="motion">Уменьшить анимацию <span aria-hidden="true"></span></button>' +
      '<button class="reset" type="button" data-action="reset">Сбросить настройки</button>' +
      '</section>' +
      '<button class="launcher" type="button" aria-label="Настройки доступности" aria-expanded="false" aria-controls="a11y-panel">' +
      '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="5" r="3" fill="currentColor"/><path d="M5 11.5c3.5 1 7.2 1.5 11 1.5s7.5-.5 11-1.5M16 13v7m0 0-5 8m5-8 5 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    document.documentElement.appendChild(host);

    var panel = shadow.querySelector('.panel');
    var launcher = shadow.querySelector('.launcher');
    var smaller = shadow.querySelector('[data-action="smaller"]');
    var larger = shadow.querySelector('[data-action="larger"]');
    var output = shadow.querySelector('output');

    function update() {
      var root = document.documentElement;
      if (settings.scale === 100) root.removeAttribute('data-a11y-scale');
      else root.setAttribute('data-a11y-scale', String(settings.scale));
      ['contrast', 'links', 'motion'].forEach(function (name) {
        root.toggleAttribute('data-a11y-' + name, settings[name]);
        var button = shadow.querySelector('[data-action="' + name + '"]');
        button.setAttribute('aria-pressed', String(settings[name]));
        button.querySelector('span').textContent = settings[name] ? 'Вкл.' : 'Выкл.';
      });
      output.textContent = settings.scale + '%';
      smaller.disabled = settings.scale === scales[0];
      larger.disabled = settings.scale === scales[scales.length - 1];
      try { localStorage.setItem(key, JSON.stringify(settings)); } catch (error) { /* Storage is optional. */ }
    }

    function setOpen(open) {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      if (open) shadow.querySelector('.close').focus();
      else launcher.focus();
    }

    launcher.addEventListener('click', function () { setOpen(panel.hidden); });
    shadow.querySelector('.close').addEventListener('click', function () { setOpen(false); });
    shadow.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        setOpen(false);
      }
    });
    panel.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      var action = button.getAttribute('data-action');
      if (action === 'smaller' || action === 'larger') {
        var step = action === 'larger' ? 1 : -1;
        settings.scale = scales[Math.max(0, Math.min(scales.length - 1, scales.indexOf(settings.scale) + step))];
      } else if (action === 'reset') {
        settings = Object.assign({}, defaults);
      } else if (Object.prototype.hasOwnProperty.call(defaults, action)) {
        settings[action] = !settings[action];
      }
      update();
    });
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
