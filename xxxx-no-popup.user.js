// ==UserScript==
// @name         防彈出新分頁
// @namespace    no-popup
// @version      1.1
// @author       killnopig
// @license      MIT
// @description  阻止點擊播放鍵時跳出新分頁 / 彈窗廣告。感謝 nike 大
// @include      /^https?:\/\/([^/]+\.)?m[i]ssav\.(com|ws|ai)\//
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const log = (...a) => console.log('[防彈窗]', ...a);

  // 判斷連結是否指向外部網域
  const isExternal = (href) => {
    try {
      return new URL(href, location.href).hostname !== location.hostname;
    } catch (e) {
      return false;
    }
  };

  // 1. 封鎖 window.open，回傳假視窗物件避免網站腳本報錯
  const fakeWindow = () => ({
    closed: false,
    close() { this.closed = true; },
    focus() {}, blur() {}, postMessage() {},
    location: { href: '', assign() {}, replace() {} },
    document: { write() {}, writeln() {}, open() {}, close() {} },
  });
  const blockedOpen = function (url) {
    log('已攔截 window.open:', url);
    return fakeWindow();
  };
  try {
    Object.defineProperty(window, 'open', {
      value: blockedOpen, writable: false, configurable: false,
    });
  } catch (e) {
    window.open = blockedOpen;
  }

  // 2. 攔截使用者點擊到的外部 target=_blank 連結
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[target="_blank"]');
    if (a && isExternal(a.href)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      log('已攔截外部連結點擊:', a.href);
    }
  }, true);

  // 3. 攔截腳本動態建立 <a> 再呼叫 .click() 的手法
  const origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.target === '_blank' && isExternal(this.href)) {
      log('已攔截 a.click():', this.href);
      return;
    }
    return origClick.call(this);
  };

  // 4. 攔截 dispatchEvent 模擬點擊
  const origDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function (ev) {
    if (this instanceof HTMLAnchorElement && ev && ev.type === 'click' &&
        this.target === '_blank' && isExternal(this.href)) {
      log('已攔截模擬點擊:', this.href);
      return true;
    }
    return origDispatch.call(this, ev);
  };

  // 5. 防止切到背景 / 視窗失焦時自動暫停播放
  //    讓網站永遠以為分頁在前景、視窗有焦點
  try {
    Object.defineProperty(Document.prototype, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(Document.prototype, 'webkitHidden', { get: () => false, configurable: true });
    Object.defineProperty(Document.prototype, 'visibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(Document.prototype, 'webkitVisibilityState', { get: () => 'visible', configurable: true });
    Document.prototype.hasFocus = () => true;
  } catch (e) {
    log('無法覆寫可見性屬性:', e);
  }
  const swallow = (e) => {
    // 只擋視窗 / 文件層級的事件，不影響輸入框等元素自己的 blur
    if (e.target === window || e.target === document) {
      e.stopImmediatePropagation();
    }
  };
  ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focusout'].forEach((type) => {
    window.addEventListener(type, swallow, true);
  });

  // 6. 攔截 target=_blank 的表單送出
  const origSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function () {
    if (this.target === '_blank') {
      log('已攔截表單送出');
      return;
    }
    return origSubmit.call(this);
  };
})();
