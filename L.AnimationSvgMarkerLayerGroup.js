
// https://code.tutsplus.com/articles/data-structures-with-javascript-stack-and-queue--cms-23348
function Queue() {
    this._oldestIndex = 1;
    this._newestIndex = 1;
    this._storage = {};
}
 
Queue.prototype.size = function() {
    return this._newestIndex - this._oldestIndex;
};
 
Queue.prototype.enqueue = function(data) {
    this._storage[this._newestIndex] = data;
    this._newestIndex++;
};
 
Queue.prototype.dequeue = function() {
    var oldestIndex = this._oldestIndex,
        newestIndex = this._newestIndex,
        deletedData;
 
    if (oldestIndex !== newestIndex) {
        deletedData = this._storage[oldestIndex];
        delete this._storage[oldestIndex];
        this._oldestIndex++;
 
        return deletedData;
    }
};

// 
L.AnimationSvgMarkerLayerGroup = L.LayerGroup.extend({

    initialize: function (layers) {
        this.alias = {};
        this.queue = new Queue();

        this._layers = {};

        var i, len;

        if (layers) {
            for (i = 0, len = layers.length; i < len; i++) {
                this.addLayer(layers[i]);
            }
        }

        L.LayerGroup.prototype.initialize.call(layers);
    },

    addMarker: function(key, latLng, options) {
        if (this.alias.hasOwnProperty(key)) {
            return;
        }
        else if (0 == this.queue.size()) {
            var lyr = L.animationsvgmarker(latLng, options);
            var id = this.getLayerId(lyr);
            lyr.addToFadeIn(this._map);
            this.addLayer(lyr);
            this.alias[key] = id;
            return this._layers[this.alias[key]];
        } else {
            var id = g.queue.dequeue();
            this.alias[key] = id;
            this._layers[id].addToFadeIn(this._map);
            this._layers[id].moveTo(latLng, 5);
        }
    },

    getMarker: function(key) {
        return this._layers[this.alias[key]];
    },

    removeMarker: function(key) {
        if (this.alias.hasOwnProperty(key)) {
            var id = this.alias[key];
            this._layers[id].removeFadeOut();
            delete this.alias[key];
            this.queue.enqueue(id);
        }
    }

});






/*

var g = new L.AnimationSvgMarkerLayerGroup();
g.addTo(map);
g.addMarker("test1", L.latLng([20,20]), {timestamp: 10, type:"marker"})
g.addMarker("test2", L.latLng([-20,-20]), {timestamp: 10, type:"circle"})
g.getMarker("test1")
g.getMarker("test2")

g.getMarker("test1").moveTo(L.latLng(30,70),10)

*/


