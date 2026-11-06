// ==UserScript==
// @name         MEGA TV - Episode Navigation
// @namespace    https://github.com/crazyrabbit0
// @version      1.3
// @description  Prev/Next top-right next to Επιστροφή, same bar style + arrow keys
// @author       CrazyRabbit
// @match        https://www.megatv.com/tvshows/*
// @match        https://www.megatv.com/gtvshows/*
// @match        https://www.megatv.com/etvshows/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=megatv.com
// @grant        none
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright    2026+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL  https://github.com/crazyrabbit0/UserScripts
// @supportURL   https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=MEGA%20TV%20-%20Episode%20Navigation%20-%20Issue
// @downloadURL  https://github.com/crazyrabbit0/UserScripts/raw/master/MEGA%20TV%20-%20Episode%20Navigation.user.js
// @updateURL    https://github.com/crazyrabbit0/UserScripts/raw/master/MEGA%20TV%20-%20Episode%20Navigation.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  const moreBtn = document.querySelector('a[href*="/episodes?id="]');
  if (!moreBtn) return;
  const base = new URL(moreBtn.href, location.origin);
  const canon = (document.querySelector('link[rel="canonical"]')?.href || location.href).replace(/\/$/, '') + '/';
  const norm = (u) => u.replace(/\/$/, '') + '/';
  const epNum = (u) => (u.match(/epeisodio-(\d+)-/i) || [])[1];

  async function collectEpisodes() {
    const list = [], seen = new Set();
    for (let p = 1; p <= 40; p++) {
      const url = p === 1 ? base.href : `${base.origin}/episodes/page/${p}/${base.search}`;
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) break;
      const html = await res.text();
      const hrefs = [...html.matchAll(/https:\/\/www\.megatv\.com\/(?:tvshows|gtvshows|etvshows)\/\d+\/[^"'\s]+\//g)].map(m => m[0]);
      for (const h of hrefs) if (!seen.has(h)) { seen.add(h); list.push(h); }
      if (list.some(h => norm(h) === norm(canon))) break;
      if (!html.includes(`/episodes/page/${p + 1}/`)) break;
    }
    return list;
  }

  function injectCSS() {
    if (document.getElementById('mega-pn-style')) return;
    const s = document.createElement('style');
    s.id = 'mega-pn-style';
    s.textContent = `
      .article__nav{display:flex!important;align-items:center;justify-content:space-between!important;gap:12px}
      #mega-prevnext-bar{display:flex;gap:10px;align-items:center;margin-left:auto}
      .mega-pn-btn{display:flex;align-items:center;gap:12px;background:rgba(35,42,77,.92);color:#fff!important;text-decoration:none!important;font-weight:700;font-size:15px;font-family:inherit;padding:6px 6px 6px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(6px);line-height:1;white-space:nowrap}
      .mega-pn-btn.prev{padding:6px 16px 6px 6px}
      .mega-pn-btn:hover{background:rgba(55,63,105,.96)}
      .mega-pn-btn .mega-pn-arrow{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px;flex:none}
      @media(max-width:668px){.mega-pn-btn{font-size:12px;padding:5px 5px 5px 10px;gap:8px}.mega-pn-btn.prev{padding:5px 10px 5px 5px}.mega-pn-btn .mega-pn-arrow{width:30px;height:30px;font-size:15px}}
    `;
    document.head.appendChild(s);
  }

  function render(prev, next) {
    const nav = document.querySelector('.article__nav');
    if (!nav || document.getElementById('mega-prevnext-bar')) return;
    injectCSS();
    const bar = document.createElement('div');
    bar.id = 'mega-prevnext-bar';
    const mk = (href, label, dir) => {
      const a = document.createElement('a');
      a.href = href; a.title = href;
      a.className = 'mega-pn-btn ' + dir;
      const t = document.createElement('span'); t.textContent = label;
      const ar = document.createElement('span');
      ar.className = 'mega-pn-arrow';
      ar.textContent = dir === 'prev' ? '←' : '→';
      if (dir === 'prev') a.append(ar, t); else a.append(t, ar);
      return a;
    };
    const lbl = (h, dir) => epNum(h)
      ? (dir === 'prev' ? `Προηγούμενο (Επ. ${epNum(h)})` : `Επόμενο (Επ. ${epNum(h)})`)
      : (dir === 'prev' ? 'Προηγούμενο' : 'Επόμενο');
    if (prev) bar.appendChild(mk(prev, lbl(prev, 'prev'), 'prev'));
    if (next) bar.appendChild(mk(next, lbl(next, 'next'), 'next'));
    if (!bar.children.length) return;
    nav.appendChild(bar);
    addEventListener('keydown', (e) => {
      if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
      if (e.key === 'ArrowLeft' && prev) location.href = prev;
      if (e.key === 'ArrowRight' && next) location.href = next;
    });
  }

  (async () => {
    try {
      const list = await collectEpisodes();
      const i = list.findIndex(h => norm(h) === norm(canon));
      if (i < 0) return;
      render(list[i + 1] || null, list[i - 1] || null);
    } catch (e) { console.warn('[mega-prevnext]', e); }
  })();
})();