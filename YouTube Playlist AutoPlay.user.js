// ==UserScript==
// @name		YouTube Playlist AutoPlay
// @namespace		https://github.com/crazyrabbit0
// @version		1.2
// @description		AutoPlay next Playlist item in YouTube
// @author		CrazyRabbit
// @match		https://www.youtube.com/watch?v=*&list=*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant		none
// @license		GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @homepage		https://github.com/crazyrabbit0/UserScripts
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