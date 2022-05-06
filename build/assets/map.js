import { writeResult, readState } from './logger.js'
import todaysDay from './days.js'

function followMe(map) {
    // will prompt the user for permission to access their location
    navigator.geolocation.watchPosition(pan, console.log)
    function pan(loc) {
        const { latitude, longitude } = loc.coords
        map.panTo(new google.maps.LatLng(latitude, longitude))
    }
}

function initPolygon(map) {
    // show whatever points are present for the given day
    const todaysPoints = readState(todaysDay())
    const polygon = new google.maps.Polygon({
        paths: todaysPoints,
    })
    polygon.setMap(map)

    // delcaring this here makes it available within the event listener
    const vertices = polygon.getPath()
}

function initMap() {
    // new map, centered on NE 33rd & Sandy
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.53, lng: -122.63 },
        zoom: 14,
    })

    // allow the user to click on the map to set points
    map.addListener('click', mapsMouseEvent => {
        const point = mapsMouseEvent.latLng
        try {
            vertices.push(point)
        }
        catch (e) {
            console.log('first point, probably, otherwise', e)
        }
        const result = {
            day: todaysDay(),
            point: point.toJSON(),
        }
        writeResult(result)
    })

    initPolygon(map)

    // pan the map to user's current location
    followMe(map)
}

export default initMap
