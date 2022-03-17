function writeResult(str) {
    const result = document.querySelector('#result')
    const contents = result.innerHTML
    result.innerHTML = contents ? contents + '\n' + str : str
}

export default writeResult
