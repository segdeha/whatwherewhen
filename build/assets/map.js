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
    // ConvexHullGrahamScan is currently available globally in the browser
    // TODO make it a module
    // A convex hull is a math concept that will put a rubber band around
    // the outside of a set of points
    // https://github.com/brian3kb/graham_scan_js
    const convexHull = new ConvexHullGrahamScan()

    // show whatever points are present for the given day
    const todaysPoints = readState(todaysDay())

    // calculate the convex hull
    todaysPoints.forEach(point => {
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.lng),
            icon: '/assets/img/bin.png',
            map,
        })
        convexHull.addPoint(point.lat, point.lng)
    })

    const hull = convexHull.getHull()
    const hullPoints = todaysPoints.length > 0 ? hull.map(point => {
        return new google.maps.LatLng(point.x, point.y)
    }) : []

    const polyHull = new google.maps.Polygon({
        paths: hullPoints.length > 0 ? hullPoints : [],
    })
    polyHull.setMap(map)

    // delcaring this here makes it available within the event listener
    return polyHull.getPath()
}

function initMap() {
    // new map, centered on NE 33rd & Sandy
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.53, lng: -122.63 },
        zoom: 14,
        clickableIcons: false,
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

    const vertices = initPolygon(map)

    // pan the map to user's current location
    followMe(map)
}

export default initMap
