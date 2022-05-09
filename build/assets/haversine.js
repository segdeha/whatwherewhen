// pretty much straight from https://andrew.hedges.name/experiments/haversine/

// convert degrees to radians
function deg2rad(deg) {
    // radians = degrees * pi/180
    return deg * Math.PI / 180;
}

// round to the nearest 1/1000
function round(n) {
    return Math.round(n * 1000) / 1000;
}

/**
 * @param points Array of 2 objects the following shape:
 * {
 *     lat: 45.123,
 *     lng: -122.123
 * }
 * @return float Distance in kilometers between the 2 points
 */
function findDistance(points) {
    // const Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
    const Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator

    // get values for lat1, lon1, lat2, and lon2
    const t1 = points[0].lat;
    const n1 = points[0].lng;
    const t2 = points[1].lat;
    const n2 = points[1].lng;

    // convert coordinates to radians
    const lat1 = deg2rad(t1);
    const lon1 = deg2rad(n1);
    const lat2 = deg2rad(t2);
    const lon2 = deg2rad(n2);

    // find the differences between the coordinates
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    // here's the heavy lifting
    const a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2);
    const c  = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // great circle distance in radians
    // const dm = c * Rm; // great circle distance in miles
    const dk = c * Rk; // great circle distance in km

    // round the results down to the nearest 1/1000
    // const mi = round(dm);
    const km = round(dk);

    return km;
}

export default findDistance;
