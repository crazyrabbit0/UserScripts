// ==UserScript==
// @name			YouTube Playlist AutoPlay
// @namespace		https://github.com/crazyrabbit0
// @version			1.1.0
// @description		AutoPlay next Playlist item in YouTube
// @author			CrazyRabbit
// @match			https://www.youtube.com/watch?v=*&list=*
// @icon			https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant			none
// @license			GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright		2023+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL		https://github.com/crazyrabbit0/UserScripts
// @supportURL		https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=YouTube%20Playlist%20AutoPlay%20-%20Issue
// @downloadURL		https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @updateURL		https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @run-at			document-start
// @noframes
// ==/UserScript==

(() => {
	'use strict';
	/* jshint esversion: 6 */
	/* global globalThis */

	new MutationObserver((document_mutations, document_observer) => {
		let play_time	= document.querySelector('span[class="ytp-time-current"]')
		let loop		= document.querySelector('ytd-playlist-loop-button-renderer')
		let progress	= document.querySelector('yt-page-navigation-progress')

		if (play_time && loop && progress) {
			new MutationObserver(play_time_mutations => {
				for (const mutation of play_time_mutations) {
					let has_finished	= mutation.addedNodes.length > 0 && mutation.addedNodes[0].data === document.querySelector('span[class="ytp-time-duration"]').textContent;
					let has_next_item	= document.querySelector('ytd-playlist-panel-video-renderer[selected] + ytd-playlist-panel-video-renderer') !== null;
					let isnt_video_loop	= loop.querySelector('path').getAttribute('d').substring(0, 3) !== 'M13';

					if (has_finished && has_next_item && isnt_video_loop) {
						document.querySelector('a.ytp-next-button').click();
					}
					//console.log('play_time');
				}
			}).observe(play_time, {
				childList: true
			});
			
			loop.addEventListener('click', () => {
				if (globalThis.hasOwnProperty('skip_loop_click')) {
					return
				}

				switch (globalThis.loop) {
					case undefined:
						globalThis.loop = 'playlist';
						break;
					case 'playlist':
						globalThis.loop = 'video';
						break;
					case 'video':
						delete globalThis.loop;
				}
				//console.log('loop');
			});

			new MutationObserver(progress_mutations => {
				for (const mutation of progress_mutations) {
					if (progress.getAttribute('hidden') == '' && globalThis.hasOwnProperty('loop')) {
						globalThis.skip_loop_click = true;
						switch (globalThis.loop) {
							case 'video':
								loop.querySelector('button').click();
								/* falls through */
							case 'playlist':
								setTimeout(() => loop.querySelector('button').click(), 1);
						}
						setTimeout(() => delete globalThis.skip_loop_click, 2);
					}
					//console.log('progress');
				}
			}).observe(progress, {
				attributes: true
			});

			document_observer.disconnect();
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	
})();