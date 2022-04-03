var userLocation;

function initMap() {

    mapboxgl.accessToken = mapbox_access_key;

    //Base map
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [0,0], // starting position [lng, lat]
        zoom: 2 // starting zoom
    });

    // Add geolocate control to the map.
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true
        })
    );

    //Code below runs after map is loaded
    map.on('load', () => {

        /* Add the data to your map as a layer */
        map.addLayer({
            id: 'locations',
            type: 'circle',
            /* Add a GeoJSON source containing place coordinates and information. */
            source: {
                type: 'geojson',
                data: "http://127.0.0.1:5000/locations"
            }
        });

        //Load geojson data from endpoint and save as locations variable
        //Not efficient because 2 api calls are made: ajax and to add layer above
        var locations;
        $.ajax({
            type: "get",
            dataType: "json",
            url: "http://127.0.0.1:5000/locations",
            success: function () {
                console.log("success")
            },
            statusCode: {
                404: function () {
                    alert("page not found");
                }
            }
        }).done(function (data) {
            locations = data
            console.log(locations.features)
            //Add location listings when location data is loaded
            //Not effcient to add listings for all locations, just add those close to user for performance

            //When location circle on map is clicked, show location listing
            map.on('click', (event) => {
                /* Determine if a feature in the "locations" layer exists at that point. */
                const features = map.queryRenderedFeatures(event.point, {
                  layers: ['locations']
                });
              
                /* If it does not exist, return */
                if (!features.length) return;
              
                const clickedPoint = features[0];
              
                /* Fly to the point */
                flyToStore(clickedPoint);
              
                /* Close all other popups and display popup for clicked store */
                createPopUp(clickedPoint);
              
                /* Highlight listing in sidebar (and remove highlight for all other listings) */
                const activeItem = document.getElementsByClassName('active');
                if (activeItem[0]) {
                  activeItem[0].classList.remove('active');
                }
                const listing = document.getElementById(
                  `listing-${clickedPoint.properties.id}`
                );
                listing.classList.add('active');
              });
            buildLocationList(locations);
        });

        

        //Build location listings
        function buildLocationList(locations) {
            for (const location of locations.features) {
                /* Add a new listing section to the sidebar. */
                const listings = document.getElementById('listings');
                const listing = listings.appendChild(document.createElement('div'));
                /* Assign a unique `id` to the listing. */
                listing.id = `listing-${location.properties.id}`;
                /* Assign the `item` class to each listing for styling. */
                listing.className = 'item';

                /* Add the link to the individual listing created above. */
                const link = listing.appendChild(document.createElement('a'));
                link.href = '#';
                link.className = 'title';
                link.id = `link-${location.properties.id}`;
                link.innerHTML = `${location.properties.name}`;

                /* Add details to the individual listing. */
                const details = listing.appendChild(document.createElement('div'));
                if (location.properties.category) {
                    details.innerHTML += `${location.properties.category}`;
                }
                if (location.properties.city) {
                    details.innerHTML += ` · ${location.properties.city}`; //city is not yet available
                }
                /* ADD PROPERTIES HERE
                if (store.properties.distance) {
                    const roundedDistance = Math.round(store.properties.distance * 100) / 100;
                    details.innerHTML += `<div><strong>${roundedDistance} miles away</strong></div>`;
                }
                */

                //Code to handle when a user clicks a link in the sidebar, will go to location on map
                link.addEventListener('click', function () {
                    for (const feature of locations.features) {
                      if (this.id === `link-${feature.properties.id}`) {
                        flyToStore(feature);
                        createPopUp(feature);
                      }
                    }
                    const activeItem = document.getElementsByClassName('active');
                    if (activeItem[0]) {
                      activeItem[0].classList.remove('active');
                    }
                    this.parentNode.classList.add('active');
                  });
            }
        }

    });

    function flyToStore(currentFeature) {
        map.flyTo({
          center: currentFeature.geometry.coordinates,
          zoom: 15
        });
      }
      
    function createPopUp(currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove();
    
    const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`<h3>Location</h3><h4>${currentFeature.properties.name}</h4><h4>${currentFeature.properties.category}</h4>`)
        .addTo(map);
    }

}

//Get user's locoation - Maybe not needed

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
    }

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    }
