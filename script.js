// ============================================================================
// This script is used for index.html and suggestions.html.
// Some functions are from Bootstrap v5.0 documentation to support
// Bootstrap-specific features, such as popovers.
// Reference: https://getbootstrap.com/docs/5.0/
// Created by Jia Hao Choo for GGR472 Lab 2 (Winter 2024)
// ============================================================================

// access token for mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiamlhaGFvMjkiLCJhIjoiY2xyNHhudjJsMDFrajJxbWp6ZHlqamR2MyJ9.GLj7pIC0m-_eGRtGH4AJww";

// Initialze a new map object
const map = new mapboxgl.Map({
  container: "my-map", // map container ID
  style: "mapbox://styles/jiahao29/clstm27z5002r01pcaess7gk8", // custom style url
  center: [-79.37819, 43.709952], // starting position [lng, lat]
  zoom: 11, // starting zoom level
});

var shownLine = [1, 2, 3, 4];

// functions that trigger when the map is loaded
map.on("load", () => {
  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  // Add enter full screen control to allow the section
  // with id = fullscreen-section to enter full screen
  map.addControl(
    new mapboxgl.FullscreenControl({
      container: document.getElementById("fullscreen-section"),
    }),
    "bottom-right"
  );

  // Add a scale control to the map
  map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

  // Define a new geocoder object
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca", //Try searching for places inside and outside of canada to test the geocoder
  });

  // Add the geocoder to the sidebar
  document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

  // Add station ridership geojson data source from uploaded github file
  map.addSource("stations-data", {
    type: "geojson",
    data: "https://jiah29.github.io/ggr472_lab3/data/TorontoSubwayStationsRidership.geojson",
  });

  // Add subway routes geojson data source from uploaded github file
  map.addSource("routes-data", {
    type: "geojson",
    data: "https://jiah29.github.io/ggr472_lab3/data/TorontoSubwayRoutes.geojson",
  });

  // Add station ridership data layer to the map
  map.addLayer({
    id: "stations",
    type: "circle",
    source: "stations-data",
    paint: {
      "circle-radius": [
        // linearly interpolate the radius of the circle based on the total ridership
        "interpolate",
        ["linear"],
        ["get", "Total"],
        // if total ridership is less than 1000, radius would be 5 (min)
        1000,
        10,
        // if total ridership is more than 100000, radius would be total ridership / 12000 (max)
        100000,
        ["/", ["get", "Total"], 10000],
      ],
      "circle-color": [
        // linearly interpolate the color of the circle based on the total ridership
        "interpolate",
        ["linear"],
        ["get", "Total"],
        // if total ridership is less than 1000, color would be light grey
        1000,
        "#d3d3d3",
        // if total ridership is more than 100000, color would be black
        100000,
        "#000000",
      ],
      "circle-opacity": 0.8,
    },
    // add initial filter to only show stations specified in the shownLine array
    filter: ["in", "Line", ...shownLine],
  });

  // Add another layer from the same source for highlighting purpose when mouse hovers over the station
  map.addLayer({
    id: "stations-highlight",
    type: "circle",
    source: "stations-data",
    paint: {
      "circle-radius": [
        // linearly interpolate the radius of the circle based on the total ridership
        "interpolate",
        ["linear"],
        ["get", "Total"],
        // if total ridership is less than 1000, radius would be 5 (min)
        1000,
        10,
        // if total ridership is more than 100000, radius would be total ridership / 12000 (max)
        100000,
        ["/", ["get", "Total"], 10000],
      ],
      "circle-color": "red",
      "circle-opacity": 1,
    },
    layout: {
      // set the visibility of this layer to none by default
      // only show this layer when mouse hovers over the station
      visibility: "none",
    },
    // add initial filter to only show stations specified in the shownLine array
    filter: ["in", "Line", ...shownLine],
  });

  // Add another layer from the same source with text symbol for each station's total ridership
  map.addLayer({
    id: "ridership-number",
    type: "symbol",
    source: "stations-data",
    layout: {
      "text-field": ["get", "Total"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      // position the text label above the circle
      "text-offset": [0, 2],
    },
    paint: {
      "text-color": "#000000",
    },
    // only show the ridership number text label in zoom level 14 and above
    minzoom: 14,
    // add initial filter to only show stations specified in the shownLine array
    filter: ["in", "Line", ...shownLine],
  });

  // Add subway routes data layer to the map
  map.addLayer(
    {
      id: "lines",
      type: "line",
      source: "routes-data",
      paint: {
        "line-width": 2,
        // give each route a different color based on the route
        "line-color": [
          "match",
          ["get", "route_long_name"],
          // if route is line 1, color would be yellow
          "LINE 1 (YONGE-UNIVERSITY)",
          "yellow",
          // if route is lone 2, color would be green
          "LINE 2 (BLOOR - DANFORTH)",
          "green",
          // if route is line 3, color would be blue
          "LINE 3 (SCARBOROUGH)",
          "blue",
          // if route is line 4, color would be red
          "LINE 4 (SHEPPARD)",
          "red",
          // unmatched data, color would be black
          "black",
        ],
      },
    },
    "stations-highlight"
  );
});

// Add event listener to the checkbox in sidebar for filtering out subway lines data on map
function addFilterByLineCheckboxChangeEventListener() {
  // do the function for 4 times for each subway line
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`line${i}`).addEventListener("change", function () {
      if (this.checked) {
        // if the checkbox is checked, add the line number to the shownLine array
        // if it is not already in the array
        if (!shownLine.includes(i)) {
          shownLine.push(i);
        }
      } else {
        // if the checkbox is unchecked, remove the line number from the shownLine array
        // if it is in the array
        shownLine = shownLine.filter((line) => line !== i);
      }
      // update the filter for the stations and ridership-number layer
      map.setFilter("stations", ["in", "Line", ...shownLine]);
      map.setFilter("ridership-number", ["in", "Line", ...shownLine]);
    });
  }
}

// Call the function to add event listener to the checkbox
addFilterByLineCheckboxChangeEventListener();

// Adding on hover event listener to the stations layer - when mouse enters the station
map.on("mouseenter", "stations", (e) => {
  // change cursor to pointer when mouse hovers over the station
  map.getCanvas().style.cursor = "pointer";
  // filter the stations highlight layer to only show the station that is being hovered
  map.setFilter("stations-highlight", [
    "==",
    "OBJECTID",
    e.features[0].properties.OBJECTID,
  ]);
  // show the stations highlight layer
  map.setLayoutProperty("stations-highlight", "visibility", "visible");
});

// Adding on mouse leave event listener to the stations layer - when mouse leaves the station
map.on("mouseleave", "stations", () => {
  // change cursor back to default when mouse leaves the station
  map.getCanvas().style.cursor = "";
  // hide the stations highlight layer
  map.setLayoutProperty("stations-highlight", "visibility", "none");
});
