// ==UserScript==
// @name         YouTube Playlist AutoPlay
// @namespace    https://github.com/crazyrabbit0
// @version      1.0
// @description  AutoPlay next Playlist item in YouTube
// @author       CrazyRabbit
// @homepage     https://github.com/crazyrabbit0
// @match        https://www.youtube.com/watch?v=*&list=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    new MutationObserver(mutations => {
        for (const mutation of mutations)
        {
            let has_finished	= mutation.addedNodes.length > 0 && mutation.addedNodes[0].data === document.querySelector('span[class="ytp-time-duration"]').textContent;
			let has_next_item	= document.querySelector('ytd-playlist-panel-video-renderer[selected] + ytd-playlist-panel-video-renderer') !== null;

            if (has_finished && has_next_item)
            {
                document.querySelector('a.ytp-next-button').click();
            }
        }
    }).observe(
        document.querySelector('span[class="ytp-time-current"]'),
        {
			childList: true
		}
    );

})();