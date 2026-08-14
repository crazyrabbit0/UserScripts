// ==UserScript==
// @name         Narto Drama - Bypass Ads
// @namespace    https://github.com/crazyrabbit0
// @version      1.0
// @description  Bypass the 6-ad time gate by spoofing premium status
// @author       CrazyRabbit
// @match        https://*.narto-drama.com/detail/watch/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=narto-drama.com
// @grant        none
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright    2026+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepage     https://github.com/crazyrabbit0/UserScripts
// @homepageURL  https://github.com/crazyrabbit0/UserScripts
// @supportURL   https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=Narto%20Drama%20-%20Bypass%20Ads%20-%20Issue
// @downloadURL  https://github.com/crazyrabbit0/UserScripts/raw/refs/heads/master/Narto%20Drama%20-%20Bypass%20Ads.user.js
// @updateURL    https://github.com/crazyrabbit0/UserScripts/raw/refs/heads/master/Narto%20Drama%20-%20Bypass%20Ads.user.js
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // 1. Save the browser's original fetch (network request) function
    const originalFetch = window.fetch;

    // 2. Override it with our own custom function
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');

        // 3. Listen for the exact moment the site asks the server: "Does this user have Premium?"
        if (url.includes('/auth/session')) {
            console.log("[ScriptCat] Intercepted premium check. Spoofing VIP status...");

            // 4. Force the browser to hand back a fake "Yes, they paid for No Ads" response
            return new Response(JSON.stringify({
                authenticated: true,
                user: { no_ads_active: true }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Let all other normal network requests (like loading the video) pass through untouched
        return originalFetch.apply(this, args);
    };
})();