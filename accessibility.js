/*
 * Виджет доступности без зависимостей.
 * Подключение: <script src="accessibility.js" defer></script>
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'accessibility-widget-settings';
  var WIDGET_ID = 'accessibility-widget';
  var SCALES = [100, 125, 150, 175, 200];
  var LINE_HEIGHTS = [0, 1.5, 1.8, 2];
  var LETTER_SPACINGS = [0, 0.05, 0.1, 0.15];

  var DEFAULTS = {
    scale: 100,
    contrast: false,
    links: false,
    motion: false,
    grayscale: false,
    readableFont: false,
    alignLeft: false,
    headings: false,
    focus: false,
    guide: false,
    lineHeight: 0,
    letterSpacing: 0
  };

  var TOGGLES = [
    {
      name: 'contrast',
      title: 'Усилить контраст',
      description: 'Делает цвета страницы более контрастными.'
    },
    {
      name: 'grayscale',
      title: 'Оттенки серого',
      description: 'Убирает цвета со страницы.'
    },
    {
      name: 'links',
      title: 'Подчеркнуть ссылки',
      description: 'Добавляет подчёркивание всем ссылкам.'
    },
    {
      name: 'headings',
      title: 'Выделить заголовки',
      description: 'Обводит заголовки страницы.'
    },
    {
      name: 'focus',
      title: 'Выделить фокус',
      description: 'Показывает заметную рамку при работе с клавиатурой.'
    },
    {
      name: 'readableFont',
      title: 'Простой шрифт',
      description: 'Использует Arial для основного текста.'
    },
    {
      name: 'alignLeft',
      title: 'Выравнивание по началу',
      description: 'Выравнивает текст по началу строки.'
    },
    {
      name: 'motion',
      title: 'Уменьшить анимацию',
      description: 'Сокращает CSS-анимации и переходы.'
    },
    {
      name: 'guide',
      title: 'Линейка чтения',
      description: 'Показывает горизонтальную линию под указателем.'
    }
  ];

  function loadSettings() {
    var result = Object.assign({}, DEFAULTS);
    var saved;

    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      return result;
    }

    if (!saved || typeof saved !== 'object') {
      return result;
    }

    Object.keys(DEFAULTS).forEach(function (name) {
      if (typeof DEFAULTS[name] === 'boolean' && typeof saved[name] === 'boolean') {
        result[name] = saved[name];
      }
    });

    if (SCALES.indexOf(saved.scale) !== -1) {
      result.scale = saved.scale;
    }
    if (LINE_HEIGHTS.indexOf(saved.lineHeight) !== -1) {
      result.lineHeight = saved.lineHeight;
    }
    if (LETTER_SPACINGS.indexOf(saved.letterSpacing) !== -1) {
      result.letterSpacing = saved.letterSpacing;
    }

    return result;
  }

  function saveSettings(settings) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // Настройки продолжают работать до закрытия страницы.
    }
  }

  function createPageStyles() {
    var style = document.createElement('style');
    style.setAttribute('data-accessibility-widget', '');
    style.textContent = `
      html[data-a11y-scale="125"] body { zoom: 1.25 !important; }
      html[data-a11y-scale="150"] body { zoom: 1.5 !important; }
      html[data-a11y-scale="175"] body { zoom: 1.75 !important; }
      html[data-a11y-scale="200"] body { zoom: 2 !important; }

      html[data-a11y-contrast] body { filter: contrast(1.5) !important; }
      html[data-a11y-grayscale] body { filter: grayscale(1) !important; }
      html[data-a11y-contrast][data-a11y-grayscale] body {
        filter: contrast(1.5) grayscale(1) !important;
      }

      html[data-a11y-links] body a {
        text-decoration: underline !important;
        text-underline-offset: 0.15em !important;
      }

      html[data-a11y-headings] body :is(h1, h2, h3, h4, h5, h6) {
        outline: 2px solid #d16100 !important;
        outline-offset: 3px !important;
      }

      html[data-a11y-focus] body :focus-visible {
        outline: 3px solid #e86a00 !important;
        outline-offset: 3px !important;
      }

      html[data-a11y-readable-font] body,
      html[data-a11y-readable-font] body :is(p, h1, h2, h3, h4, h5, h6, li, label, input, textarea, select, button) {
        font-family: Arial, sans-serif !important;
      }

      html[data-a11y-align-left] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote) {
        text-align: start !important;
      }

      html[data-a11y-line-height="1.5"] body,
      html[data-a11y-line-height="1.5"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        line-height: 1.5 !important;
      }
      html[data-a11y-line-height="1.8"] body,
      html[data-a11y-line-height="1.8"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        line-height: 1.8 !important;
      }
      html[data-a11y-line-height="2"] body,
      html[data-a11y-line-height="2"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        line-height: 2 !important;
      }

      html[data-a11y-letter-spacing="0.05"] body,
      html[data-a11y-letter-spacing="0.05"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        letter-spacing: 0.05em !important;
      }
      html[data-a11y-letter-spacing="0.1"] body,
      html[data-a11y-letter-spacing="0.1"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        letter-spacing: 0.1em !important;
      }
      html[data-a11y-letter-spacing="0.15"] body,
      html[data-a11y-letter-spacing="0.15"] body :is(p, h1, h2, h3, h4, h5, h6, li, blockquote, label) {
        letter-spacing: 0.15em !important;
      }

      html[data-a11y-motion],
      html[data-a11y-motion] body {
        scroll-behavior: auto !important;
      }
      html[data-a11y-motion] body *,
      html[data-a11y-motion] body *::before,
      html[data-a11y-motion] body *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  function createWidget() {
    var host = document.createElement('div');
    host.id = WIDGET_ID;

    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 2147483647;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        [hidden] {
          display: none !important;
        }

        button, select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:focus-visible, select:focus-visible {
          outline: 3px solid #ffbf47;
          outline-offset: 3px;
        }

        button:disabled, select:disabled {
          opacity: .5;
          cursor: default;
        }

        .launcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          margin-left: auto;
          border: 2px solid #fff;
          border-radius: 50%;
          color: #fff;
          background: #1648a5;
          box-shadow: 0 4px 16px #0005;
        }

        .launcher:hover {
          background: #10377e;
        }

        .panel {
          width: min(370px, calc(100vw - 32px));
          max-height: calc(100vh - 100px);
          overflow: auto;
          margin-bottom: 12px;
          padding: 18px;
          border: 1px solid #b9c2d2;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 6px 24px #0004;
          font-size: 16px;
          line-height: 1.4;
          overscroll-behavior: contain;
        }

        .heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.2;
        }

        h3 {
          margin: 0 0 10px;
          font-size: 16px;
          line-height: 1.3;
        }

        .intro {
          margin: 5px 0 0;
          color: #485670;
          font-size: 13px;
        }

        .close {
          flex: none;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 6px;
          background: #edf1f7;
          color: #172033;
          font-size: 24px;
          line-height: 1;
        }

        .group {
          margin-top: 17px;
          padding-top: 16px;
          border-top: 1px solid #e0e5ed;
        }

        .stepper {
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          align-items: center;
          gap: 8px;
          margin: 8px 0 14px;
          text-align: center;
        }

        .stepper button {
          height: 40px;
          border: 1px solid #73809a;
          border-radius: 6px;
          background: #fff;
          color: #172033;
          font-size: 22px;
        }

        .stepper output {
          font-weight: bold;
        }

        .setting-label {
          margin: 12px 0 0;
          font-weight: bold;
        }

        .option, .action, .reset {
          width: 100%;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #73809a;
          border-radius: 6px;
          background: #fff;
          color: #172033;
          text-align: left;
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
        }

        .option[aria-pressed="true"] {
          border-color: #1648a5;
          background: #e5edff;
          color: #10377e;
        }

        .option-title {
          display: block;
          font-weight: bold;
        }

        .option-description {
          display: block;
          margin-top: 2px;
          color: #485670;
          font-size: 12px;
          line-height: 1.3;
        }

        .option-state {
          flex: none;
          font-size: 13px;
          font-weight: bold;
        }

        .action, .reset {
          margin-top: 8px;
          color: #10377e;
          font-weight: bold;
          text-align: center;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .hint, .status {
          margin: 8px 0 0;
          color: #485670;
          font-size: 13px;
        }

        .status:empty {
          display: none;
        }

        .heading-select {
          width: 100%;
          min-height: 44px;
          margin-top: 6px;
          padding: 8px;
          border: 1px solid #73809a;
          border-radius: 6px;
          background: #fff;
          color: #172033;
        }

        .guide {
          position: fixed;
          left: 0;
          top: 50%;
          width: 100vw;
          height: 4px;
          background: #ed6500;
          box-shadow: 0 0 0 1px #fff;
          pointer-events: none;
        }

        @media (max-width: 480px) {
          :host {
            right: 16px;
            bottom: 16px;
          }
        }
      </style>

      <div class="guide" aria-hidden="true" hidden></div>
      <section class="panel" id="a11y-panel" aria-labelledby="a11y-title" hidden>
        <div class="heading">
          <div>
            <h2 id="a11y-title">Доступность</h2>
            <p class="intro">Настройте страницу под себя</p>
          </div>
          <button class="close" type="button" aria-label="Закрыть настройки">×</button>
        </div>

        <div class="group">
          <h3>Размер и текст</h3>
          <p class="setting-label">Масштаб страницы</p>
          <div class="stepper">
            <button type="button" data-action="scale-down" aria-label="Уменьшить масштаб">−</button>
            <output data-output="scale" aria-live="polite"></output>
            <button type="button" data-action="scale-up" aria-label="Увеличить масштаб">+</button>
          </div>

          <p class="setting-label">Межстрочный интервал</p>
          <div class="stepper">
            <button type="button" data-action="lineHeight-down" aria-label="Уменьшить межстрочный интервал">−</button>
            <output data-output="lineHeight" aria-live="polite"></output>
            <button type="button" data-action="lineHeight-up" aria-label="Увеличить межстрочный интервал">+</button>
          </div>

          <p class="setting-label">Интервал между буквами</p>
          <div class="stepper">
            <button type="button" data-action="letterSpacing-down" aria-label="Уменьшить интервал между буквами">−</button>
            <output data-output="letterSpacing" aria-live="polite"></output>
            <button type="button" data-action="letterSpacing-up" aria-label="Увеличить интервал между буквами">+</button>
          </div>
          <div data-toggle-group="text"></div>
        </div>

        <div class="group">
          <h3>Изображение и навигация</h3>
          <div data-toggle-group="visual"></div>
        </div>

        <div class="group">
          <h3>Переход по заголовкам</h3>
          <label for="heading-select">Выберите заголовок страницы</label>
          <select id="heading-select" class="heading-select"></select>
          <button class="action" type="button" data-action="refresh-headings">Обновить список</button>
          <p class="hint">Список содержит видимые заголовки h1–h6.</p>
        </div>

        <div class="group">
          <h3>Чтение вслух</h3>
          <p class="hint">Выделите текст на странице, затем нажмите «Прочитать».</p>
          <div class="actions">
            <button class="action" type="button" data-action="speak">Прочитать</button>
            <button class="action" type="button" data-action="stop-speaking">Остановить</button>
          </div>
          <p class="status" role="status" aria-live="polite"></p>
        </div>

        <div class="group">
          <button class="reset" type="button" data-action="reset">Сбросить настройки</button>
        </div>
      </section>

      <button class="launcher" type="button" aria-label="Настройки доступности"
        aria-expanded="false" aria-controls="a11y-panel">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="5" r="3" fill="currentColor" />
          <path d="M5 11.5c3.5 1 7.2 1.5 11 1.5s7.5-.5 11-1.5M16 13v7m0 0-5 8m5-8 5 8"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    `;

    // Элементы управления не масштабируются и не фильтруются вместе с body.
    document.documentElement.appendChild(host);
    return shadow;
  }

  function init() {
    if (document.getElementById(WIDGET_ID)) {
      return;
    }

    var settings = loadSettings();
    createPageStyles();
    var shadow = createWidget();
    var panel = shadow.querySelector('.panel');
    var launcher = shadow.querySelector('.launcher');
    var closeButton = shadow.querySelector('.close');
    var guide = shadow.querySelector('.guide');
    var headingSelect = shadow.querySelector('#heading-select');
    var status = shadow.querySelector('.status');
    var headingElements = [];
    var speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    var currentUtterance = null;

    function createToggle(option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.dataset.action = option.name;
      button.setAttribute('aria-label', option.title);

      var text = document.createElement('span');
      var title = document.createElement('span');
      title.className = 'option-title';
      title.textContent = option.title;
      var description = document.createElement('span');
      description.className = 'option-description';
      description.textContent = option.description;
      text.appendChild(title);
      text.appendChild(description);

      var state = document.createElement('span');
      state.className = 'option-state';
      state.setAttribute('aria-hidden', 'true');
      button.appendChild(text);
      button.appendChild(state);

      var group = option.name === 'readableFont' || option.name === 'alignLeft' ? 'text' : 'visual';
      shadow.querySelector('[data-toggle-group="' + group + '"]').appendChild(button);
    }

    TOGGLES.forEach(createToggle);

    function setRootAttribute(name, value) {
      var root = document.documentElement;
      if (value === false || value === 0 || value === null) {
        root.removeAttribute(name);
      } else {
        root.setAttribute(name, value === true ? '' : String(value));
      }
    }

    function updateStepper(name, values, label) {
      var index = values.indexOf(settings[name]);
      shadow.querySelector('[data-output="' + name + '"]').textContent = label;
      shadow.querySelector('[data-action="' + name + '-down"]').disabled = index === 0;
      shadow.querySelector('[data-action="' + name + '-up"]').disabled = index === values.length - 1;
    }

    function update() {
      setRootAttribute('data-a11y-scale', settings.scale === 100 ? null : settings.scale);
      setRootAttribute('data-a11y-line-height', settings.lineHeight);
      setRootAttribute('data-a11y-letter-spacing', settings.letterSpacing);

      var attributes = {
        contrast: 'contrast',
        links: 'links',
        motion: 'motion',
        grayscale: 'grayscale',
        readableFont: 'readable-font',
        alignLeft: 'align-left',
        headings: 'headings',
        focus: 'focus'
      };

      Object.keys(attributes).forEach(function (name) {
        setRootAttribute('data-a11y-' + attributes[name], settings[name]);
      });

      TOGGLES.forEach(function (option) {
        var button = shadow.querySelector('[data-action="' + option.name + '"]');
        button.setAttribute('aria-pressed', String(settings[option.name]));
        button.querySelector('.option-state').textContent = settings[option.name] ? 'Вкл.' : 'Выкл.';
      });

      updateStepper('scale', SCALES, settings.scale + '%');
      updateStepper('lineHeight', LINE_HEIGHTS, settings.lineHeight ? String(settings.lineHeight) : 'Обычный');
      updateStepper('letterSpacing', LETTER_SPACINGS, settings.letterSpacing ? settings.letterSpacing + ' em' : 'Обычный');
      guide.hidden = !settings.guide;
      saveSettings(settings);
    }

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      if (open) {
        refreshHeadings();
        closeButton.focus();
      } else if (returnFocus !== false) {
        launcher.focus();
      }
    }

    function changeStep(name, values, direction) {
      var index = values.indexOf(settings[name]);
      var next = Math.max(0, Math.min(values.length - 1, index + direction));
      settings[name] = values[next];
    }

    function isVisible(element) {
      var style = window.getComputedStyle(element);
      return element.getClientRects().length > 0 && style.visibility !== 'hidden';
    }

    function refreshHeadings() {
      headingElements = Array.prototype.filter.call(
        document.querySelectorAll('body h1, body h2, body h3, body h4, body h5, body h6'),
        function (element) {
          return isVisible(element) && element.textContent.trim();
        }
      );

      headingSelect.replaceChildren();
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = headingElements.length ? 'Выберите заголовок' : 'Заголовки не найдены';
      headingSelect.appendChild(placeholder);
      headingSelect.disabled = headingElements.length === 0;

      headingElements.forEach(function (element, index) {
        var option = document.createElement('option');
        option.value = String(index);
        option.textContent = element.tagName + ' — ' + element.textContent.trim().replace(/\s+/g, ' ').slice(0, 120);
        headingSelect.appendChild(option);
      });
    }

    function goToHeading(element) {
      if (!element || !element.isConnected) {
        refreshHeadings();
        return;
      }
      setOpen(false, false);
      var hadTabindex = element.hasAttribute('tabindex');
      if (!hadTabindex) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (!hadTabindex) {
        function restoreTabindex(event) {
          if (event.type === 'focusin' && event.target === element) return;
          if (element.getAttribute('tabindex') === '-1') {
            element.removeAttribute('tabindex');
          }
          element.removeEventListener('blur', restoreTabindex);
          document.removeEventListener('focusin', restoreTabindex, true);
        }
        element.addEventListener('blur', restoreTabindex);
        document.addEventListener('focusin', restoreTabindex, true);
      }
    }

    function stopSpeaking() {
      if (speechAvailable && currentUtterance) {
        // The browser API cancels the shared speech queue.
        currentUtterance.onend = null;
        currentUtterance.onerror = null;
        window.speechSynthesis.cancel();
        currentUtterance = null;
      }
    }

    function speakSelection() {
      if (!speechAvailable) {
        status.textContent = 'В этом браузере чтение вслух недоступно.';
        return;
      }
      var selection = window.getSelection();
      var text = selection ? selection.toString().trim() : '';
      if (!text) {
        status.textContent = 'Сначала выделите текст на странице.';
        return;
      }
      if (!currentUtterance && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        status.textContent = 'Дождитесь окончания текущего чтения.';
        return;
      }
      stopSpeaking();
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || 'ru-RU';
      utterance.onend = function () {
        if (currentUtterance === utterance) {
          currentUtterance = null;
          status.textContent = 'Чтение завершено.';
        }
      };
      utterance.onerror = function () {
        if (currentUtterance === utterance) {
          currentUtterance = null;
          status.textContent = 'Не удалось прочитать текст.';
        }
      };
      currentUtterance = utterance;
      status.textContent = 'Чтение началось.';
      window.speechSynthesis.speak(utterance);
    }

    launcher.addEventListener('click', function () {
      setOpen(panel.hidden);
    });

    closeButton.addEventListener('click', function () {
      setOpen(false);
    });

    shadow.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        setOpen(false);
      }
    });

    document.addEventListener('pointermove', function (event) {
      if (settings.guide) {
        guide.style.top = event.clientY + 'px';
      }
    }, { passive: true });

    headingSelect.addEventListener('change', function () {
      if (headingSelect.value !== '') {
        goToHeading(headingElements[Number(headingSelect.value)]);
      }
    });

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) {
        return;
      }

      var action = button.dataset.action;
      var steps = {
        'scale-down': ['scale', SCALES, -1],
        'scale-up': ['scale', SCALES, 1],
        'lineHeight-down': ['lineHeight', LINE_HEIGHTS, -1],
        'lineHeight-up': ['lineHeight', LINE_HEIGHTS, 1],
        'letterSpacing-down': ['letterSpacing', LETTER_SPACINGS, -1],
        'letterSpacing-up': ['letterSpacing', LETTER_SPACINGS, 1]
      };

      if (steps[action]) {
        changeStep(steps[action][0], steps[action][1], steps[action][2]);
      } else if (action === 'reset') {
        settings = Object.assign({}, DEFAULTS);
        stopSpeaking();
        status.textContent = 'Настройки сброшены.';
      } else if (action === 'refresh-headings') {
        refreshHeadings();
        return;
      } else if (action === 'speak') {
        speakSelection();
        return;
      } else if (action === 'stop-speaking') {
        stopSpeaking();
        status.textContent = 'Чтение остановлено.';
        return;
      } else if (typeof DEFAULTS[action] === 'boolean') {
        settings[action] = !settings[action];
      } else {
        return;
      }
      update();
    });

    if (!speechAvailable) {
      shadow.querySelector('[data-action="speak"]').disabled = true;
      shadow.querySelector('[data-action="stop-speaking"]').disabled = true;
      status.textContent = 'В этом браузере чтение вслух недоступно.';
    }

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
