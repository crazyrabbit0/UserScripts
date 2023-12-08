// ==UserScript==
// @name		YouTube Playlist AutoPlay
// @namespace		https://github.com/crazyrabbit0
// @version		1.0.8
// @description		AutoPlay next Playlist item in YouTube
// @author		CrazyRabbit
// @match		https://www.youtube.com/watch?v=*&list=*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant		none
// @license		GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright		2023+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL		https://github.com/crazyrabbit0/UserScripts
// @supportURL		https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=YouTube%20Playlist%20AutoPlay%20-%20Issue
// @downloadURL		https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @updateURL		https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @run-at		document-start
// @noframes
// ==/UserScript==

// jshint esversion: 6
(function() {
	'use strict';
	
	new MutationObserver((document_mutations, document_observer) => {
		let play_time = document.querySelector('span[class="ytp-time-current"]')
		if (play_time) {
			new MutationObserver(play_time_mutations => {
				for (const mutation of play_time_mutations) {
					let has_finished	= mutation.addedNodes.length > 0 && mutation.addedNodes[0].data === document.querySelector('span[class="ytp-time-duration"]').textContent;
					let has_next_item	= document.querySelector('ytd-playlist-panel-video-renderer[selected] + ytd-playlist-panel-video-renderer') !== null;
					
					if (has_finished && has_next_item) {
						document.querySelector('a.ytp-next-button').click();
					}
				}
			}).observe(play_time, {
				childList: true
			});
			document_observer.disconnect();
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	
})();