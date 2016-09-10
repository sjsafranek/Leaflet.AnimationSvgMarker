Leaflet Animation Svg Marker
============================

Moving Leaflet marker for CSS3 powered animations and color transformations.

Check out the [demo](http://sjsafranek.github.io/Leaflet.AnimationSvgMarker/).

---------


### Requirements
 - d3 version 3 or 4


## Usage examples

````js
var marker = L.animationsvgmarker(L.latLng(0, 0), { color: "red" });
marker.addToFadeIn(map);
marker.moveTo(L.latLng(20, 20), 1000);
marker.changeColor("purple", 800);
marker.setProperties({"message": "I am a marker"});
marker.removeFadeOut();
````

## Functions
- **addToFadeIn**: params map, milliseconds
- **moveTo**: params L.latLng, milliseconds
- **changeColor**: params color, milliseconds
- **removeFadeOut**: params milliseconds
- **setProperties**: params feature properties

