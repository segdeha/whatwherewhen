import { writeResult, readState } from './logger.js'
import todaysDay from './days.js'

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.533, lng: -122.63 },
        zoom: 14,
    })
    map.addListener('click', mapsMouseEvent => {
        const point = mapsMouseEvent.latLng
        vertices.push(point)
        const result = {
            day: todaysDay(),
            point: point.toJSON(),
        }
        writeResult(result)
    })
    const todaysPoints = readState(todaysDay())
    const polygon = new google.maps.Polygon({
        paths: todaysPoints,
    })
    polygon.setMap(map)
    const vertices = polygon.getPath()
}

export default initMap
