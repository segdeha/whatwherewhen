import sortPoints from './sorter.js'

const LOCALSTORAGE_KEY = 'whatwherewhen'

function initData() {
    let data = readState()
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
        saveData(data)
    }
}

function saveData(data) {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data))
}

function writeResult(result) {
    const data = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY))
    data[result.day].push(result.point)
    saveData(data)
}

function readState(day) {
    const json = localStorage.getItem(LOCALSTORAGE_KEY)
    let data = JSON.parse(json)
    if (day) {
        // FIXME attempts to put the points in an order that results
        // in a contiguous polygon ... doesn't always work
        data[day] = data[day].sort((a, b) => {
            return a.lng > b.lng ? 1 : a.lng < b.lng ? -1 : 0;
        }).sort((a, b) => {
            return a.lat > b.lat ? 1 : a.lat < b.lat ? -1 : 0;
        })
    }
    return day ? sortPoints(data[day]) : data
}

export { initData, writeResult, readState }
