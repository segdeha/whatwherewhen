import initMap from './map.js';

function writeResult(str) {
    const result = document.querySelector('#result')
    const contents = result.innerHTML
    result.innerHTML = contents ? contents + '\n' + str : str
}

function init() {
    writeResult('hello, world')
    writeResult('hello, yourself')
    initMap()
}

init()
