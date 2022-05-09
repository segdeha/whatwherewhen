import { writeResult, readState } from './logger.js'
import todaysDay from './days.js'

function followMe(map) {
    // TODO integrate findDistance from haversine.js to auto-zoom
    // the map when the user is on the move
    // 0.05km seems a reasonable distance

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

    // add points to the map and to the hull
    todaysPoints.forEach(point => {
        addMarker(map, new google.maps.LatLng(point.lat, point.lng))
        convexHull.addPoint(point.lat, point.lng)
    })

    // calculate the convex hull
    const hull = convexHull.getHull()
    const hullPoints = todaysPoints.length > 0 ? hull.map(point => {
        return new google.maps.LatLng(point.x, point.y)
    }) : []

    const polygon = new google.maps.Polygon({
        paths: hullPoints.length > 0 ? hullPoints : [],
    })
    polygon.setMap(map)

    // delcaring this here makes it available within the event listener
    return polygon.getPath()
}

function addMarker(map, point) {
    const marker = new google.maps.Marker({
        position: point,
        icon: '/assets/img/bin.png',
        map,
    })
}

function addPoint(mapsMouseEvent) {
    const point = mapsMouseEvent.latLng
    try {
        // this === vertices
        this.vertices.push(point)
        addMarker(this.map, point)
    }
    catch (e) {
        console.log('First point, probably, otherwise', e)
    }
    const result = {
        day: todaysDay(),
        point: point.toJSON(),
    }
    writeResult(result)
}

function initMap() {
    // new map, centered on NE 33rd & Sandy
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.53, lng: -122.63 },
        zoom: 14,
        clickableIcons: false,
    })

    const vertices = initPolygon(map)

    // allow the user to click on the map to set points
    map.addListener('click', addPoint.bind({ map, vertices }))

    // pan the map to user's current location
    followMe(map)
}

export default initMap
