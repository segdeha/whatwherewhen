
function writeResult(str) {
    const result = document.querySelector('#result')
    const contents = result.innerHTML
    result.innerHTML = contents + '\n' + str
}

function init() {
    writeResult('hello, world')
    writeResult('hello, yourself')
}

init()
