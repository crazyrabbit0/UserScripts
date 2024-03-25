// ==UserScript==
// @name            YouTube Playlist AutoPlay
// @namespace       https://github.com/crazyrabbit0
// @version         2.0.0
// @description     AutoPlay next Playlist item in YouTube
// @author          CrazyRabbit
// @match           http://*.youtube.com/*
// @match           https://*.youtube.com/*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant           none
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright       2023+, CrazyRabbit (https://github.com/crazyrabbit0)
// @homepageURL     https://github.com/crazyrabbit0/UserScripts
// @supportURL      https://github.com/crazyrabbit0/UserScripts/issues/new?assignees=crazyrabbit0&labels=help+wanted&template=&title=YouTube%20Playlist%20AutoPlay%20-%20Issue
// @downloadURL     https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @updateURL       https://github.com/crazyrabbit0/UserScripts/raw/master/YouTube%20Playlist%20AutoPlay.user.js
// @run-at          document-start
// @noframes
// ==/UserScript==

(function() {
    'use strict'
    
    let elements = {
        player: null,
        progress: null,
        loop: null
    }
    
    let loaded = {
        player: false,
        progress: false
    }
    
    let loop = {
        code: null,
        value: null,
        map: {
            //'M21': '',
            'M20': 'playlist',
            'M13': 'video'
        }
    }
    
    let loaded_check = setInterval(function() {
        if(!loaded.player && elements.player) {
            loaded.player = true

            new MutationObserver(function(mutations) {
                for(const mutation of mutations) {
                    if(mutation.target.classList.contains('ended-mode')) {
                        //let has_next_item   = document.querySelector('ytd-playlist-panel-video-renderer[selected] + ytd-playlist-panel-video-renderer') !== null
                        let has_next_item = elements.player.querySelector('.ytp-next-button').href.includes('list=')
                        let has_video_loop = elements.loop.querySelector('path')?.getAttribute('d').substring(0, 3) === 'M13'
                        //let ads		      = document.querySelector('.video-ads')
                        
                        if(has_next_item && !has_video_loop) {
                            elements.player.querySelector('.ytp-next-button').click()
                        }
                        //console.log('video-ended')
                    }
                }
            }).observe(elements.player, {
                attributeFilter: [ "class" ]
            })
        }
        else {
            elements.player = document.querySelector('div#movie_player')
        }
        
        if(!loaded.progress && elements.progress && elements.loop) {
            loaded.progress = true
            
            new MutationObserver(function(mutations) {
                for(const mutation of mutations) {
                    if(!mutation.target.hasAttribute('hidden')) {
                        loop.code = elements.loop.querySelector('path')?.getAttribute('d').substring(0, 3)
                        loop.value = loop.code.replace(/M\d+/, function(match) { return loop.map[match] || '' })
                    }
                    else {
                        switch (loop.value) {
                            case 'video':
                                elements.loop.click()
                                /* falls through */
                            case 'playlist':
                                setTimeout(function() { elements.loop.click() }, 1)
                        }
                        //console.log('progress-finished')
                    }
                    //console.log('progress-hidden-changed')
                }
            }).observe(elements.progress, {
                attributeFilter: [ "hidden" ]
            })
        }
        else {
            elements.progress = document.querySelector('yt-page-navigation-progress')
            elements.loop = document.querySelector('ytd-playlist-loop-button-renderer button')
        }
        
        if(Object.values(loaded).every(Boolean)) {
            clearInterval(loaded_check)
            //console.log('document-observer-removed')
        }
    }, 500)
})()