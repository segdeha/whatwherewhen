import writeResult from './logger.js'

let map

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    })
    map.addListener('click', mapsMouseEvent => {
        const str = JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 4)
        writeResult(str)
    })
}

export default initMap

/*

map.addListener("click", (mapsMouseEvent) => {
  // Create a new InfoWindow.
  infoWindow = new google.maps.InfoWindow({
    position: mapsMouseEvent.latLng,
  });
  infoWindow.setContent(
    JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
  );
  infoWindow.open(map);
});

*/