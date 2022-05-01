// from: https://cs.stackexchange.com/a/52627

function sortPoints(points) {
    points = points.splice(0)
    const p0 = {}
    p0.lat = Math.min.apply(null, points.map(p=>p.lat))
    p0.lng = Math.max.apply(null, points.filter(p=>p.lat == p0.lat).map(p=>p.lng))
    points.sort((a,b)=>angleCompare(p0, a, b))
    return points
}

function angleCompare(p0, a, b) {
    const left = isLeft(p0, a, b)
    if (left == 0) return distCompare(p0, a, b)
    return left
}

function isLeft(p0, a, b) {
    return (a.lng-p0.lng)*(b.lat-p0.lat) - (b.lng-p0.lng)*(a.lat-p0.lat)
}

function distCompare(p0, a, b) {
    const distA = (p0.lng-a.lng)*(p0.lng-a.lng) + (p0.lat-a.lat)*(p0.lat-a.lat)
    const distB = (p0.lng-b.lng)*(p0.lng-b.lng) + (p0.lat-b.lat)*(p0.lat-b.lat)
    return distA - distB
}

export default sortPoints
