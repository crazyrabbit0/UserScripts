// ==UserScript==
// @name         Distill - Simulate Tab Visibility
// @namespace    https://github.com/crazyrabbit0
// @version      1.2.0
// @description  Lets pages that only load in a visible tab also load in background tabs, e.g. Distill Web Monitor checks. Fakes tab visibility, animation frames and observers, and switches itself off once you view the tab.
// @author       CrazyRabbit
// @match        https://store.steampowered.com/news/*
// @match        https://artificialanalysis.ai/*
// @match        https://chromeenterprise.google/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=distill.io
// @grant        none
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright    2026+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL  https://github.com/crazyrabbit0/UserScripts
// @supportURL   https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=Distill%20-%20Simulate%20Tab%20Visibility%20-%20Issue
// @downloadURL  https://github.com/crazyrabbit0/UserScripts/raw/master/Distill%20-%20Simulate%20Tab%20Visibility.user.js
// @updateURL    https://github.com/crazyrabbit0/UserScripts/raw/master/Distill%20-%20Simulate%20Tab%20Visibility.user.js
// @run-at       document-start
// @early-start
// ==/UserScript==

(() => {
  // true  = treat every lazy-loaded part as on screen (current behaviour, most reliable)
  // false = only what the first two screens would show (lighter; set back to true if a monitor misses content)
  const ALL_IN_VIEW = true;

  const D = Document.prototype;
  const orig = {
    hidden: Object.getOwnPropertyDescriptor(D, 'hidden'),
    visibilityState: Object.getOwnPropertyDescriptor(D, 'visibilityState'),
    hasFocus: D.hasFocus,
    raf: window.requestAnimationFrame,
    caf: window.cancelAnimationFrame,
  };
  const isHidden = () => orig.visibilityState.get.call(document) !== 'visible';
  if (!isHidden()) return; // opened in front: leave the page alone

  // 1. Look visible and focused; undo it as soon as the tab is really shown
  Object.defineProperty(D, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(D, 'visibilityState', { get: () => 'visible', configurable: true });
  D.hasFocus = () => true;
  window.addEventListener('visibilitychange', function restore() {
    if (isHidden()) return;
    Object.defineProperty(D, 'hidden', orig.hidden);
    Object.defineProperty(D, 'visibilityState', orig.visibilityState);
    D.hasFocus = orig.hasFocus;
    window.removeEventListener('visibilitychange', restore, true);
  }, true);

  // 2. Animation frames: timers while hidden, the real thing once shown
  const fakeFrames = new Map();
  let nextId = 1e9;
  window.requestAnimationFrame = function (cb) {
    if (!isHidden()) return orig.raf.call(window, cb);
    const id = nextId++;
    fakeFrames.set(id, setTimeout(() => { fakeFrames.delete(id); cb(performance.now()); }, 16));
    return id;
  };
  window.cancelAnimationFrame = function (id) {
    if (!fakeFrames.has(id)) return orig.caf.call(window, id);
    clearTimeout(fakeFrames.get(id));
    fakeFrames.delete(id);
  };

  // 3. Observers: answer once right away while hidden; the browser's own take over once shown
  const answerFirst = (Native, makeEntry) => class extends Native {
    constructor(cb, opts) { super(cb, opts); this._cb = cb; this._els = new Set(); }
    observe(el, opts) {
      super.observe(el, opts);
      this._els.add(el);
      setTimeout(() => {
        if (isHidden() && this._els.has(el)) this._cb.call(this, [makeEntry(el, el.getBoundingClientRect())], this);
      });
    }
    unobserve(el) { this._els.delete(el); super.unobserve(el); }
    disconnect() { this._els.clear(); super.disconnect(); }
  };
  window.IntersectionObserver = answerFirst(IntersectionObserver, (el, r) => {
    const hit = ALL_IN_VIEW || (r.width + r.height > 0 && r.bottom > 0 && r.top < innerHeight * 2);
    return { target: el, time: performance.now(), boundingClientRect: r,
             rootBounds: new DOMRect(0, 0, innerWidth, innerHeight),
             intersectionRect: hit ? r : new DOMRect(), isIntersecting: hit, intersectionRatio: hit ? 1 : 0 };
  });
  window.ResizeObserver = answerFirst(ResizeObserver, (el, r) => {
    const size = [{ inlineSize: r.width, blockSize: r.height }];
    return { target: el, contentRect: r, borderBoxSize: size, contentBoxSize: size, devicePixelContentBoxSize: size };
  });
})();