# ggr472_lab3

GGR472 Lab 3 - Jia Hao Choo

This repository contains my work for Lab 3 of GGR472: Developing Web Maps (Winter 2024), which focuses on map design and interactivity using Mapbox, JavaScript and HTML.

The web map can be accessed [here](https://jiah29.github.io/ggr472_lab3/).

It is a web map that provides a visualizations of both Toronto Subway Lines and Subway Stations. Features are styled based on classifications:

- Subway lines features are classified according to their route name, and are colored accordingly.
- Subway stations point features are classified according to their total ridership value, and the larger the value, the larger the point size and the darker the point color.

Here are the interactivity and dynamic styling features implemented:

- User can interact with the map by hovering over and clicking on the subway lines and stations features.
- When hovering over the features, styling of the features will change to indicate that the feature is being interacted with:
  - Subway line features become thicken.
  - Subway stations points become red.
  - The cursor will change to a pointer indicating that the feature is clickable.
- When clicking on the features, a popup will appear with information about the feature:
  - For subway lines, the popup will display the route name, and total number of stations for that route.
  - For subway stations, the popup will display the station name, total ridership value, and which subway lines the station is a part of. Also, there will be a zoom in icon in the pop up that will zoom in to the station when clicked.
- There are also map controls via other HTML elements on the page, specifically in the sidebar beside the map:
  - Users can filter features by subway line using checkboxes provided
  - Users can also toggle on and off the subway stations and subway line features using checkboxes provided.
  - There is also a geocoder search bar that allows users to search for a location and the map will zoom to that location.
- Lastly, there are map controls within the map interface itself:
  - There is a navigation control and a scale control on the bottom right of the map.
  - There is a full screen control on the top right of the map, which allows users to view the map in full screen mode.

There is also a legend that is dynamically added to the bottom left of map.

- The legend will only show the legend for features that are currently visible on the map, so when the user toggle on or off a layer, the legend will update accordingly.
- For subway lines legend items, it also only shows the currently visible subway lines.
