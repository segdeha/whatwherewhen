import initMap from './map.js';
import { initData } from './logger.js';
import todaysDay from './days.js'

function initUI() {
    document.querySelector('h1').innerHTML = todaysDay()
}

function init() {
    initData()
    initMap()
    initUI()
}

init()
