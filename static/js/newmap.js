function initMap() {

    var testData = testLocations;

    mapboxgl.accessToken = mapbox_access_key;

    const filterGroup = document.getElementById('filter-group');

    //Base map
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [2.3, 48.8], // starting position [lng, lat]
        zoom: 4 // starting zoom
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

    map.on('load', () => {

        //function to load data
        function loadData() {
            endpoint = 'http://127.0.0.1:5000/locations'
            $.ajax({
                url: endpoint,
                contentType: "application/json",
                dataType: 'json',
                success: function (result) {
                    console.log(result);
                    console.log(typeof (result));
                    return JSON.parse(result)
                }
            })
        }


        // Add a GeoJSON source containing place coordinates and information.
        map.addSource('locations', {
            'type': 'geojson',
            'data': testData //'http://127.0.0.1:5000/locations'
        });

        // Add a base layer showing the locations.
        map.addLayer({
            'id': 'location',
            'source': 'locations',
            'type': 'circle',
            'paint': {
                'circle-color': '#4264fb',
                'circle-radius': 2,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        for (const feature of testData.features) {
            const category = feature.properties.category;
            const symbol = feature.properties.icon;
            const layerID = `poi-${symbol}`;

            // Add a layer for this symbol type if it hasn't been added already.
            if (!map.getLayer(layerID)) {
                map.addLayer({
                    'id': layerID,
                    'type': 'symbol',
                    'source': 'locations',
                    'layout': {
                        // These icons are a part of the Mapbox Light style.
                        // To view all images available in a Mapbox style, open
                        // the style in Mapbox Studio and click the "Images" tab.
                        // To add a new image to the style at runtime see
                        // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                        'icon-image': `${symbol}-15`,
                        'icon-allow-overlap': true
                    },
                    'filter': ['==', 'icon', symbol]
                });

                // Add checkbox and label elements for the layer.
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = layerID;
                input.checked = true;
                filterGroup.appendChild(input);

                const label = document.createElement('label');
                label.setAttribute('for', layerID);
                label.textContent = category;
                filterGroup.appendChild(label);

                // When the checkbox changes, update the visibility of the layer.
                input.addEventListener('change', (e) => {
                    map.setLayoutProperty(
                        layerID,
                        'visibility',
                        e.target.checked ? 'visible' : 'none'
                    );
                });
            }
        }

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'location', (e) => {

            //fly to location on click 
            flyToLocation(e.features[0])

            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const html = `
                        <h3>Name: ${e.features[0].properties.name}</h3>
                        <a href="http://127.0.0.1:5000/location/page/${e.features[0].properties.id}">View details</a>
                        <a href="#">Get Directions</a>
                        `

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(map);
        });

        function flyToLocation(currentFeature) {
            map.flyTo({
                center: currentFeature.geometry.coordinates,
                zoom: 15
            });
        }

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'location', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'location', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}


