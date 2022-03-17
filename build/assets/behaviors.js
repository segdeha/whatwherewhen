
function writeResult(str) {
    const result = document.querySelector('#result')
    const contents = result.innerHTML
    result.innerHTML = contents + str
}

function init() {
    writeResult('hello, world')
}

init()
