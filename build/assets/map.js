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
    lastCoords: { lat: 45.531714, lng: -122.630676 }, // NE 33rd & Sandy
    // lastCoords: { lat: 45.531549, lng: -122.632114 }, // sw of home
    // lastCoords: { lat: 45.533961, lng: -122.627865 }, // ne of home
    direction: 'n', // 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'
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
        // always move the user whether or not we’re following them
        moveMeMarker(latitude, longitude)
        // set state after we move the marker so that function can
        // also set the direction
        state.lastCoords = { lat: latitude, lng: longitude }
    }
}

function panToCoords(lat, lng) {
    state.map.panTo(new google.maps.LatLng(lat, lng))
}

// Converts from degrees to radians.
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

// from: https://stackoverflow.com/a/52079217
// i don't understand it, but it works
function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

function setDirection(lat, lng) {
    // compare passed in lat, lng with state.lastCoords
    // to determine which way the icon should face
    const brng = bearing(state.lastCoords.lat, state.lastCoords.lng, lat, lng)

    // 0 - 22.5 ... 0 + 22.5
    if (brng > -22.5 && brng < 22.5) {
        state.direction = 'n'
    }
    // 180 - 22.5 ... 180 + 22.5
    else if (brng > 157.5 && brng < 202.5) {
        state.direction = 's'
    }
    // 90 - 22.5 ... 90 + 22.5
    else if (brng > 67.5 && brng < 112.5) {
        state.direction = 'e'
    }
    // 270 - 22.5 ... 270 + 22.5
    else if (brng > 247.5 && brng < 292.5) {
        state.direction = 'w'
    }
    // 45 - 22.5 ... 45 + 22.5
    else if (brng > 22.5 && brng < 67.5) {
        state.direction = 'ne'
    }
    // 315 - 22.5 ... 315 + 22.5
    else if (brng > 292.5 && brng < 327.5) {
        state.direction = 'nw'
    }
    // 135 - 22.5 ... 135 + 22.5
    else if (brng > 112.5 && brng < 157.5) {
        state.direction = 'se'
    }
    // 202.5 - 22.5 ... 202.5 + 22.5
    else {
        state.direction = 'sw'
    }

    document.querySelector('#debug').innerHTML = document.querySelector('#debug').innerHTML + `${state.direction}<br>`

}

function getIcon() {
    const icon = {
        url: `/assets/img/me-${state.direction}.png`,
        scaledSize: new google.maps.Size(16, 16),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0, 0),
    }
    return icon
}

function makeMeMarker(lat, lng) {
    const position = new google.maps.LatLng(lat, lng)
    const icon = getIcon()
    const { map } = state
    state.meMarker = new google.maps.Marker({ position, icon, map })
}

function moveMeMarker(lat, lng) {
    const newPosition = new google.maps.LatLng(lat, lng)
    setDirection(lat, lng)
    panToCoords(lat, lng)
    state.meMarker.setPosition(newPosition)
    const icon = getIcon()
    state.meMarker.setIcon(icon)
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
    const center = state.lastCoords
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
