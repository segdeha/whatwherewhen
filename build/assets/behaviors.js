import initMap from './map.js';

function initData() {
    let data = localStorage.getItem('whatwherewhen')
    if (!data) {
        data = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
        }
        localStorage.setItem('whatwherewhen', JSON.stringify(data))
    }
}

function init() {
    initData()
    initMap()
}

init()
