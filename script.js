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
  center: [-79.370703, 43.6723538], // starting position [lng, lat]
  zoom: 11, // starting zoom level
});

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

  // Add station ridership geojson data source from uploaded github file
  map.addSource("stations-data", {
    type: "geojson",
    data: "https://jiah29.github.io/ggr472_lab3/data/TorontoSubwayStationsRidership.geojson",
  });

  // Add station ridership data layer to the map
  map.addLayer({
    id: "stations",
    type: "circle",
    source: "stations-data",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "Ridership"],
        0,
        5,
        100000,
        20,
      ],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "Ridership"],
        0,
        "#ff0000",
        100000,
        "#00ff00",
      ],
      "circle-opacity": 0.8,
    },
  });
});

// functions that trigger when the map is idle after load
map.on("idle", () => {});
