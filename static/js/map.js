function initMap() {

    var testdata = testlocations;

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


    //Holds visible location features for filtering

    let locations = [];

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false
    });

    const filterEl = document.getElementById('feature-filter');
    const listingEl = document.getElementById('feature-listing');

    function renderListings(features) {
        const empty = document.createElement('p');
        // Clear any existing listings
        listingEl.innerHTML = '';
        if (features.length) {
            for (const feature of features) {
                const itemLink = document.createElement('a');
                const label = `${feature.properties.name} (${feature.properties.category})`;
                itemLink.href = "#";
                //itemLink.target = '_blank';
                itemLink.textContent = label;
                //Add id to link item
                itemLink.id = `link-${feature.properties.id}`;

                itemLink.addEventListener('mouseover', () => {
                    // Highlight corresponding feature on the map
                    popup
                        .setLngLat(feature.geometry.coordinates)
                        .setText(label)
                        .addTo(map);
                });
                //Code to handle when a user clicks a link in the sidebar, will go to location on map
                itemLink.addEventListener('click', function () {
                    for (const feature of features) {
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
                listingEl.appendChild(itemLink);
            }

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
        } else if (features.length === 0 && filterEl.value !== '') {
            empty.textContent = 'No results found';
            listingEl.appendChild(empty);
        } else {
            empty.textContent = 'Drag the map to populate results';
            listingEl.appendChild(empty);

            // Hide the filter input
            filterEl.parentNode.style.display = 'none';

            // remove features filter
            map.setFilter('location', ['has', 'id']);
        }
    }

    function flyToStore(currentFeature) {
        map.flyTo({
            center: currentFeature.geometry.coordinates,
            zoom: 15
        });
    }

    /* Not needed */
    function createPopUp(currentFeature) {
        const popUps = document.getElementsByClassName('mapboxgl-popup');
        /** Check if there is already a popup on the map and if so, remove it */
        if (popUps[0]) popUps[0].remove();

        const popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(currentFeature.geometry.coordinates)
            .setHTML(`<h4>Name: ${currentFeature.properties.name}</h4>
                      <p>Category: ${currentFeature.properties.category}</p>
                      <a href="#">Get directions</a> 
                      <a href="http://127.0.0.1:5000/location/${currentFeature.properties.id}">View details</a> 
                    `) 
                    //add link to directions
                    //before used currentFeature.properties.name //contains html as string //perhaps this string can be returned from backend endpoint?
            .addTo(map);
    }

    function getPopUpData(id) {
        $.ajax({
            url: "http://127.0.0.1:5000/location/" + String(id),
            dataType: 'JSON',
            success: function (response) {
                return response
            }
        });

    }

    function normalize(string) {
        return string.trim().toLowerCase();
    }

    // Because features come from tiled vector data,
    // feature geometries may be split
    // or duplicated across tile boundaries.
    // As a result, features may appear
    // multiple times in query results.
    function getUniqueFeatures(features, comparatorProperty) {
        const uniqueIds = new Set();
        const uniqueFeatures = [];
        for (const feature of features) {
            const id = feature.properties[comparatorProperty];
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                uniqueFeatures.push(feature);
            }
        }
        return uniqueFeatures;
    }

    map.on('load', () => {
        map.addSource('locations', {
            'type': 'geojson',
            'data': testdata, //use this url when testing is finished 'http://127.0.0.1:5000/locations'
        });
        
        map.addLayer({
            'id': 'location',
            'source': 'locations',
            'type': 'circle',
            'paint': {
                'circle-color': '#4264fb',
                'circle-radius': 4,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });


        map.on('movestart', () => {
            // reset features filter as the map starts moving
            map.setFilter('location', ['has', 'name']);  //Show locations for which name is defined?
        });

        map.on('moveend', () => {
            const features = map.queryRenderedFeatures({ layers: ['location'] });

            if (features) {
                const uniqueFeatures = getUniqueFeatures(features, 'id');
                // Populate features for the listing overlay.
                renderListings(uniqueFeatures);

                // Clear the input container
                filterEl.value = '';


                // Store the current features in sn `locations` variable to
                // later use for filtering on `keyup`.
                locations = uniqueFeatures;
            }

            for (const feature of features) {

                if (feature.properties.category=="nightlife") {
                    feature.properties.category="bar"
                }

                var symbol = feature.properties.category;

                console.log(symbol)

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
                        'filter': ['==', 'category', symbol]
                    });

                    // Add checkbox and label elements for the layer.
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = layerID;
                    input.checked = true;
                    filterGroup.appendChild(input);

                    const label = document.createElement('label');
                    label.setAttribute('for', layerID);
                    label.textContent = symbol;
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

        });

        map.on('mousemove', 'location', (e) => {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            // Populate the popup and set its coordinates based on the feature.
            const feature = e.features[0];
            popup
                .setLngLat(feature.geometry.coordinates)
                .setText(
                    `${feature.properties.name} (${feature.properties.category})`
                )
                .addTo(map);
        });

        map.on('mouseleave', 'location', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        filterEl.addEventListener('keyup', (e) => {
            const value = normalize(e.target.value);

            // Filter visible features that match the input value.
            const filtered = [];
            for (const feature of locations) {
                const name = normalize(feature.properties.name);
                const category = normalize(feature.properties.category);
                if (name.includes(value) || category.includes(value)) {
                    filtered.push(feature);
                }
            }

            // Populate the sidebar with filtered results
            renderListings(filtered);

            // Set the filter to populate features into the layer.
            if (filtered.length) {
                map.setFilter('location', [
                    'match',
                    ['get', 'id'],
                    filtered.map((feature) => {
                        return feature.properties.id;
                    }),
                    true,
                    false
                ]);
            }
        });



        // Call this function on initialization
        // passing an empty array to render an empty state
        renderListings([]);
    });
}


