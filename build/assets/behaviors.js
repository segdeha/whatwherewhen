import initMap from './map.js';
import { initData } from './logger.js';
import todaysDay from './days.js'

function initUI() {
    let today = todaysDay()
    let cappedDay = today[0].toUpperCase() + today.substring(1)
    document.querySelector('h1').innerHTML = `Where are they on a ${cappedDay}?`
}

function init() {
    initData()
    initMap()
    initUI()
}

init()
