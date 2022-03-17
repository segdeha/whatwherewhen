import writeResult from './logger.js'
import todaysDay from './days.js'

let map

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    })
    map.addListener('click', mapsMouseEvent => {
        const result = {
            day: todaysDay(),
            point: mapsMouseEvent.latLng.toJSON(),
        }
        const str = JSON.stringify(result, null, 4)
        writeResult(str)
    })
}

export default initMap
