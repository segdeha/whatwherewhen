import { initMap, toggleFollowing } from './map.js';
import { initData } from './logger.js';
import todaysDay from './days.js'

function initUI() {
    const today = todaysDay()
    selectNavItem(today)
    document.querySelector('[data-day="follow"] a').addEventListener('click', toggleFollowing)
}

function selectNavItem(day) {
    const lis = document.querySelectorAll('header ul li')
    for (let i = 0; i < lis.length; i += 1) {
        lis[i].classList.remove('selected')
    }
    const li = document.querySelector(`[data-day="${day}"]`)
    li.classList.add('selected')
}

function init() {
    initData()
    initMap()
    initUI()
}

init()
