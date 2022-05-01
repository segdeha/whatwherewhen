import { writeResult, readState } from './logger.js'
import todaysDay from './days.js'

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    })
    const todaysPoints = readState(todaysDay())
    map.addListener('click', mapsMouseEvent => {
        const result = {
            day: todaysDay(),
            point: mapsMouseEvent.latLng.toJSON(),
        }
        writeResult(result)
    })
    map.data.add({
      geometry: new google.maps.Data.Polygon([todaysPoints]),
    })
}

export default initMap
