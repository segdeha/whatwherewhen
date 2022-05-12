import { writeResult, removePoint, readState } from './logger.js'
import todaysDay from './days.js'

const state = {
    map: null,
    vertices: [],
    shouldFollow: true,
    lastCoords: { lat: 45.53, lng: -122.63 }
}

function toggleFollowing() {
    state.shouldFollow = !state.shouldFollow
    const { lat, lng } = state.lastCoords
    state.shouldFollow && panToCoords(lat, lng)
    document.querySelector('[data-day="follow"] a').classList.toggle('disabled')
}

function followMe() {
    // TODO integrate findDistance from haversine.js to auto-zoom
    // the map when the user is on the move
    // 0.05km seems a reasonable distance

    // will prompt the user for permission to access their location
    navigator.geolocation.watchPosition(pan, console.log)
    function pan(loc) {
        const { latitude, longitude } = loc.coords
        state.lastCoords = { lat: latitude, lng: longitude }
        if (state.shouldFollow) {
            panToCoords(latitude, longitude)
        }
    }
}

function panToCoords(lat, lng) {
    state.map.panTo(new google.maps.LatLng(lat, lng))
}

function initPolygon() {
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
        addMarker(new google.maps.LatLng(point.lat, point.lng))
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
    polygon.setMap(state.map)

    // delcaring this here makes it available within the event listener
    return polygon.getPath()
}

function addMarker(point) {
    const marker = new google.maps.Marker({
        position: point,
        icon: '/assets/img/bin.png',
        map: state.map,
    })
    marker.addListener('click', removeMarker.bind({ marker }))
}

function removeMarker() {
    const { vertices } = state
    const lat = this.marker.position.lat()
    const lng = this.marker.position.lng()
    for (let i = 0; i < vertices.length; i += 1) {
        const v = vertices.getAt(i)
        const vLat = v.lat()
        const vLng = v.lng()
        if (vLat === lat && vLng === lng) {
            removePoint(vLat, vLng)
            this.marker.setMap(null)
            break
        }
    }
}

function addPoint(mapsMouseEvent) {
    const point = mapsMouseEvent.latLng
    try {
        state.vertices.push(point)
        addMarker(point)
    }
    catch (e) {
        // FIXME
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
    state.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.53, lng: -122.63 },
        zoom: 14,
        clickableIcons: false,
    })

    state.vertices = initPolygon()

    // allow the user to click on the map to set points
    state.map.addListener('click', addPoint)

    // pan the map to user's current location
    followMe()
}

export { initMap, toggleFollowing }
