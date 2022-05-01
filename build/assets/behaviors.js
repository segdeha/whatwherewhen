import initMap from './map.js';
import { initData } from './logger.js';
import todaysDay from './days.js'

function init() {
    initData()
    initMap()
    document.querySelector('h1').innerHTML = todaysDay()
}

init()
