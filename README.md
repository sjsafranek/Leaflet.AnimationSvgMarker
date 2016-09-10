Leaflet.AnimationSvgMarker
==========================

Animated Leaflet marker for movement and color transformations.

---------




Check out the [demo](http://sjsafranek.github.io/Leaflet.AnimationSvgMarker/).

### Requirements
 - d3 version 3 or 4


## Usage examples

var marker = L.animationsvgmarker(L.latLng(0, 0), { color: "red" });
marker.addToFadeIn(map);
marker.moveTo(L.latLng(20, 20), 1000);
marker.changeColor("purple", 800);
marker.removeFadeOut();

## Functions
- **addToFadeIn**: params map, milliseconds
- **moveTo**: params L.latLng, milliseconds
- **changeColor**: params color, milliseconds
- **removeFadeOut**: params milliseconds

