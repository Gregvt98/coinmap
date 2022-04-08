function geolocate() {
    //Get user's locoation - Maybe not needed

    var userLocation;

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(success, error, options)
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        userLocation = [crd.longitude, crd.latitude]
        console.log(userLocation)
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

}