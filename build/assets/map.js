import { writeResult, removePoint, readState } from './logger.js'
import todaysDay from './days.js'

const DEFAULT_ZOOM = 14

// ConvexHullGrahamScan is currently available globally in the browser
// TODO make it a module
// A convex hull is a math concept that will put a rubber band around
// the outside of a set of points
// https://github.com/brian3kb/graham_scan_js
// made this global so the object wouldn’t be created anew each time
// we redraw the map
const convexHull = new ConvexHullGrahamScan()

const state = {
    map: null,
    vertices: [],
    meMarker: null,
    polygon: null,
    lastCoords: { lat: 45.53, lng: -122.63 }
}

function zoom() {
    const { lat, lng } = state.lastCoords
    panToCoords(lat, lng)
    state.map.setZoom(DEFAULT_ZOOM + 3)
}

function followMe() {
    // will prompt the user for permission to access their location
    navigator.geolocation.watchPosition(pan, console.log)
    function pan(loc) {
        const { latitude, longitude } = loc.coords
        state.lastCoords = { lat: latitude, lng: longitude }
        // always move the user whether or not we’re following them
        moveMeMarker(latitude, longitude)
        panToCoords(latitude, longitude)
    }
}

function panToCoords(lat, lng) {
    state.map.panTo(new google.maps.LatLng(lat, lng))
}

function makeMeMarker(lat, lng) {
    const position = new google.maps.LatLng(lat, lng)
    const icon = {
        url: '/assets/img/me.png',
        scaledSize: new google.maps.Size(16, 16),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0, 0),
    }
    const { map } = state
    state.meMarker = new google.maps.Marker({ position, icon, map })
}

function moveMeMarker(lat, lng) {
    const newPosition = new google.maps.LatLng(lat, lng)
    state.meMarker.setPosition(newPosition)
}

function drawPolygon() {
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

    state.polygon?.setMap(null)
    state.polygon = new google.maps.Polygon({
        paths: hullPoints.length > 0 ? hullPoints : [],
    })
    state.polygon.setMap(state.map)

    // delcaring this here makes it available within the event listener
    return state.polygon.getPath()
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
        drawPolygon()
    }
    catch (e) {
        // FIXME
        console.log('First point, probably, otherwise', e)
        // FIXME super janky workaround
        document.querySelector('[data-day="reload"] a').click()
    }
    const result = {
        day: todaysDay(),
        point: point.toJSON(),
    }
    writeResult(result)
}

function initMap() {
    const center = { lat: 45.53, lng: -122.63 }
    const { lat, lng } = center
    // new map, centered on NE 33rd & Sandy
    state.map = new google.maps.Map(document.getElementById("map"), {
        center,
        zoom: DEFAULT_ZOOM,
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
    })

    state.vertices = drawPolygon()

    // allow the user to click on the map to set points
    state.map.addListener('click', addPoint)

    makeMeMarker(lat, lng)

    // pan the map to user's current location
    followMe()
}

export { initMap, zoom }
