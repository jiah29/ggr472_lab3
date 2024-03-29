// ============================================================================
// This script is used for index.html and suggestions.html.
// Created by Jia Hao Choo for GGR472 Lab 3 (Winter 2024)
// ============================================================================

/* ----------------------------------------------------------------------------
Mapbox map, sources and layers setup
---------------------------------------------------------------------------- */

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

// variable to keep track of which subway lines are currently shown on the map
// by default, all subway lines are shown
var shownLine = [1, 2, 3, 4];

// functions that trigger when the map is loaded
map.on("load", () => {
  // Add a scale control to the map
  map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  // Add fullscreen control to the map
  map.addControl(
    new mapboxgl.FullscreenControl({
      container: document.querySelector("main-content"),
    }),
    "top-right"
  );

  // Define a new geocoder object
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca", //Try searching for places inside and outside of canada to test the geocoder
  });

  // Add the geocoder to the sidebar
  document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

  // Add station ridership data geojson data source from uploaded github file
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
        // linearly interpolate the radius of the circle based on the total ridership
        "interpolate",
        ["linear"],
        ["get", "Total"],
        // if total ridership is less than 1000, radius would be 10 (min)
        1000,
        10,
        // if total ridership is more than 100000, radius would be total ridership / 10000 (max)
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

  // Add another layer from the same station ridership data source for highlighting purpose
  // when mouse hovers over one station
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
        // if total ridership is less than 1000, radius would be 10 (min)
        1000,
        10,
        // if total ridership is more than 100000, radius would be total ridership / 10000 (max)
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

  // Add another layer from the same station ridership data source with text symbol
  // to show the total ridership number for each station
  map.addLayer({
    id: "ridership-number",
    type: "symbol",
    source: "stations-data",
    layout: {
      // get the total ridership from the "Total" property and convert it to string
      // then concatenate it with the text "Total Ridership: "
      "text-field": [
        "concat",
        "Total Ridership: ",
        ["to-string", ["get", "Total"]],
      ],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      // position the text label below the circle, the y offset is based on the total ridership
      // since the radius of the circle is not constant to avoid overlapping
      "text-offset": [
        0,
        ["interpolate", ["linear"], ["get", "Total"], 1000, 1, 100000, 3],
      ],
    },
    paint: {
      "text-color": "#000000",
    },
    // only show the ridership number text label in zoom level 14 and above
    minzoom: 14,
    // add initial filter to only show stations specified in the shownLine array
    filter: ["in", "Line", ...shownLine],
  });

  // Add subway routes geojson data source from uploaded github file
  map.addSource("routes-data", {
    type: "geojson",
    data: "https://jiah29.github.io/ggr472_lab3/data/TorontoSubwayRoutes.geojson",
  });

  // Add subway routes data layer to the map
  map.addLayer(
    {
      id: "routes",
      type: "line",
      source: "routes-data",
      paint: {
        // set line width based on feature state
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          6,
          3,
        ],
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
      layout: {
        // set the visibility of this layer to visible by default
        visibility: "visible",
      },
      // add initial filter to only show stations specified in the shownLine array
      filter: ["in", "Line", ...shownLine],
    },
    "stations-highlight"
  );
});

/* ----------------------------------------------------------------------------
HTML event listeners for map manipulation
---------------------------------------------------------------------------- */

// Add event listener to all subway line checkbox in sidebar for filtering out subway lines data on map
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
    // update the filter for lines layer
    map.setFilter("routes", ["in", "Line", ...shownLine]);

    // sort the shownLine array to maintain the order of the subway lines
    shownLine.sort();

    // reset the legend container after changes to the map
    resetLegend();
  });
}

// Add event listener for subway stations layer toggle button in sidebar
document
  .getElementById("stations-toggle")
  .addEventListener("change", function () {
    // if the toggle button is checked, show the stations layer
    if (this.checked) {
      map.setLayoutProperty("stations", "visibility", "visible");
      map.setLayoutProperty("ridership-number", "visibility", "visible");
    } else {
      // if the toggle button is unchecked, hide the stations layer
      map.setLayoutProperty("stations", "visibility", "none");
      map.setLayoutProperty("ridership-number", "visibility", "none");
    }

    // reset the legend container after changes to the map
    resetLegend();
  });

// Add event listener for subway routes layer toggle button in sidebar
document
  .getElementById("routes-toggle")
  .addEventListener("change", function () {
    // if the toggle button is checked, show the routes layer
    if (this.checked) {
      map.setLayoutProperty("routes", "visibility", "visible");
    } else {
      // if the toggle button is unchecked, hide the routes layer
      map.setLayoutProperty("routes", "visibility", "none");
    }

    // reset the legend container after changes to the map
    resetLegend();
  });

/* ----------------------------------------------------------------------------
Map object event listeners for map manipulation
---------------------------------------------------------------------------- */

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

// Add on click event to the stations layer - when user clicks on the station
map.on("click", "stations-highlight", (e) => {
  // get the station name from the clicked station's properties
  const stationName = e.features[0].properties.Station_Name;
  // get the station ridership from the clicked station's properties
  const stationRidership = e.features[0].properties.Total;
  // create a popup with the station name and ridership
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      `<div style="line-height:normal">
      <p style="font-weight: bold">${stationName}</p>
      <p>Total ridership: ${stationRidership}</p>
      <p>Line: ${e.features[0].properties.Line}</p>
      <i class="fa-solid fa-search-plus" id="zoom-in"></i>
      </div>`
    )
    .addTo(map);

  // Add click event listener to the zoom-in icon in the popup
  document.getElementById("zoom-in").addEventListener("click", () => {
    // fly to the clicked station using the station's coordinates
    map.flyTo({
      center: [e.lngLat.lng, e.lngLat.lat],
      zoom: 15,
    });
  });
});

// Add on click event on the route layer - when user clicks on the route
map.on("click", "routes", (e) => {
  // get the route name from the clicked route's properties
  const routeName = e.features[0].properties.route_long_name;
  // create a popup with the route name
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      `
    <p style="font-weight: bold">${routeName}</p>
    <p> Total Number of Stations: ${e.features[0].properties.num_stations}</p>
    `
    )
    .addTo(map);
});

// variable to keep track of which route is being hovered over, initially set to null
var hoveredRouteId = null;

// Add hover event listener to the routes layer - when mouse hovers over the route
map.on("mouseenter", "routes", (e) => {
  // change cursor to pointer when mouse hovers over the route
  map.getCanvas().style.cursor = "pointer";
  // update the hoveredRouteId to the id of the route being hovered
  hoveredRouteId = e.features[0].id;
  // set the hover feature state to true for the route
  map.setFeatureState(
    { source: "routes-data", id: hoveredRouteId },
    { hover: true }
  );
});

// Add mouse leave event listener to the routes layer - when mouse leaves the route
map.on("mouseleave", "routes", () => {
  // change cursor back to default when mouse leaves the route
  map.getCanvas().style.cursor = "";
  // set the hover feature state to false for the currently hovered route
  map.setFeatureState(
    { source: "routes-data", id: hoveredRouteId },
    { hover: false }
  );
  // reset the hoveredRouteId to null
  hoveredRouteId = null;
});

/* ----------------------------------------------------------------------------
Functions for creating dynamic map legend items
---------------------------------------------------------------------------- */

// Function to reset the legend after changes to the map;
// used in event listeners for HTML elements which changes map content
function resetLegend() {
  // always clear the legend container before adding new legend items
  clearLegend();

  // if subway lines features are shown on the map, add it
  if (document.getElementById("routes-toggle").checked) {
    addSubwayLineLegend();
  }

  // if subway stations features are shown on the map, add it
  if (document.getElementById("stations-toggle").checked) {
    addRidershipLegend();
  }
}

// Helper function to clear the legend container
function clearLegend() {
  document.getElementById("legend").innerHTML = "";
}

// Helper function to add subway line legend items to the map based on
// which subway lines are shown on the map currently
function addSubwayLineLegend() {
  // create a legend group
  const legendGroup = document.createElement("div");
  // set id of the legend group
  legendGroup.id = "subway-lines-legend";
  // add margin to the bottom of the legend group
  legendGroup.style.marginBottom = "5px";
  // create a legend group title
  const legendTitle = document.createElement("h6");
  legendTitle.textContent = "Subway Routes";
  legendGroup.appendChild(legendTitle);

  // loop through the shownLine array
  shownLine.forEach((i) => {
    // only add legend items for the subway lines that are currently shown on the map
    // legend item is a line element with color and text specifying the line number
    const legendItem = document.createElement("div");

    // create a color box for the line element
    const lineColorBox = document.createElement("div");
    // set the size of the color box to make it looks like a line
    lineColorBox.style.width = "50px";
    lineColorBox.style.height = "2px";
    // make it inline with the text
    lineColorBox.style.display = "inline-block";
    // set margin-right to separate the color box and the text
    lineColorBox.style.marginRight = "5px";
    // adjust position to move line up to make it aligned center with the text vertically
    lineColorBox.style.position = "relative";
    lineColorBox.style.top = "-5px";
    // set the color of the color box based on the line number
    lineColorBox.style.backgroundColor = ["yellow", "green", "blue", "red"][
      i - 1
    ];
    // append the color box to the legend item
    legendItem.appendChild(lineColorBox);

    // create the text beside the line element
    const legendText = document.createElement("p");
    // make the text inline with the color box
    legendText.style.display = "inline";
    legendText.textContent = `Line ${i}`;
    legendItem.appendChild(legendText);

    // append the legend item to the legend group
    legendGroup.appendChild(legendItem);
  });

  // add legend group to legend container
  document.getElementById("legend").appendChild(legendGroup);
}

// Helper function to add subway station ridership legend items to the map
function addRidershipLegend() {
  // create a legend group
  const legendGroup = document.createElement("div");
  // set id of the legend group
  legendGroup.id = "subway-stations-legend";
  // create a legend group title
  const legendTitle = document.createElement("h6");
  legendTitle.textContent = "Station Ridership";
  legendGroup.appendChild(legendTitle);

  // append the lower bound legend item to the legend group
  legendGroup.appendChild(createStationsRidershipLegendItem("lowerBound"));
  // append the upper bound legend item to the legend group
  legendGroup.appendChild(createStationsRidershipLegendItem("upperBound"));

  // add legend group to legend container
  document.getElementById("legend").appendChild(legendGroup);
}

// Helper function to create a legend item for subway station ridership legend group
function createStationsRidershipLegendItem(whichBound) {
  // create the legend itm
  const legendItem = document.createElement("div");

  // variables to set based on which bound we are creating the legend item for
  var iconSize;
  var iconColor;
  var labelText;
  var topPosition;

  if (whichBound === "lowerBound") {
    // if we are creating the lower bound legend item
    iconSize = "10px";
    iconColor = "#d3d3d3";
    labelText = "<= 1000";
    topPosition = "1px";
  } else {
    // if we are creating the upper bound legend item
    iconSize = "20px";
    iconColor = "#000000";
    labelText = ">= 100000";
    topPosition = "5px";
  }

  // create a legend icon for the legend item
  const legendIcon = document.createElement("div");
  // set the size of the legend icon
  legendIcon.style.width = iconSize;
  legendIcon.style.height = iconSize;
  // set the color of the legend icon to light grey
  legendIcon.style.backgroundColor = iconColor;
  // make it a circle
  legendIcon.style.borderRadius = "50%";
  // make it inline with the text
  legendIcon.style.display = "inline-block";
  // set margin-right to separate the legend icon and the text
  legendIcon.style.marginRight = "5px";
  // center the legend icon vertically with the text
  legendIcon.style.position = "relative";
  legendIcon.style.top = topPosition;
  // append the legend icon to the legend item
  legendItem.appendChild(legendIcon);

  // create a label for the legend item
  const legendLabel = document.createElement("p");
  // make the text inline with the legend icon
  legendLabel.style.display = "inline";
  legendLabel.textContent = labelText;
  // append the label to the legend item
  legendItem.appendChild(legendLabel);

  return legendItem;
}

// By default, add all legend items to the map
addSubwayLineLegend();
addRidershipLegend();
