
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
        this.updateQueue = new Queue();
        this.lock = false;

        this._layers = {};

        var i, len;

        if (layers) {
            for (i = 0, len = layers.length; i < len; i++) {
                this.addLayer(layers[i]);
            }
        }

        L.LayerGroup.prototype.initialize.call(layers);

        this.processUpdateQueue();
    },

    size: function() {
        return Object.keys(this._layers).length;
    },

    processUpdateQueue: function() {
        var self = this;
        setInterval(function(){
            if (!self.lock) {
                if (self.updateQueue.size() != 0) {
                    var data = self.updateQueue.dequeue();
                    self.addMarker(data.key,data.latLng,data.options);
                }
            }
        }, 50);
    },

    addMarker: function(key, latLng, options) {
        var self = this;
        if (this.lock) {
            self.updateQueue.enqueue({"key":key, "latLng":latLng, "options":options})
            return;
        }

        var self = this;
        if (this.alias.hasOwnProperty(key)) {
            this._layers[id]._icon.classList.remove("markerInvisible");
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
            var id = this.queue.dequeue();
            this.alias[key] = id;
            // this._layers[id].addToFadeIn(this._map);

            // this._layers[id]._icon.style.transition = "transform 0s";
            // this._layers[id].setLatLng(latLng);

            this._layers[id]._icon.classList.add("markerFadeIn");
            this._layers[id]._icon.classList.remove("markerInvisible");
            this._layers[id].label._container.classList.remove("markerInvisible");

            setTimeout(function(){
                if (self._layers[id]._icon) {
                    self._layers[id]._icon.classList.remove("markerFadeIn");
                }
            }, 500);

            setTimeout(function() {
                self._layers[id]._icon.classList.remove("markerInvisible");
                self._layers[id].label._container.classList.remove("markerInvisible");
            }, 1000);

            this._layers[id].moveTo(latLng, 10, 0);
            // this._layers[id].setLatLng(latLng);

            return this._layers[this.alias[key]];
        }
    },

    getMarker: function(key) {
        return this._layers[this.alias[key]];
    },

    removeMarker: function(key) {
        var self = this;
        if (this.alias.hasOwnProperty(key)) {
            var id = this.alias[key];
            delete this.alias[key];
            // this._layers[id].removeFadeOut();

            if (this._layers[id]._icon) {
                this._layers[id]._icon.classList.add("markerFadeOut");
            }
            if (this._layers[id].hasOwnProperty("label")) {
                this._layers[id].label._container.classList.add("markerFadeOut");
            }
            setTimeout(function(){
                self._layers[id]._icon.classList.remove("markerFadeOut");
                self._layers[id]._icon.classList.add("markerInvisible");
                if (self._layers[id].hasOwnProperty("label")) {
                    self._layers[id].hideLabel();
                    self._layers[id].label._container.classList.remove("markerFadeOut");
                    self._layers[id].label._container.classList.remove("markerInvisible");
                    window.clearTimeout(self._layers[id].timeoutLoop);
                    self._layers[id].timeoutLoop = null;
                    self.queue.enqueue(id);
                }
            }, 1000);

            // this.queue.enqueue(id);
        }
    },

    clearAllMarkers: function() {
        this.lock = true;
        for (var i in this.alias) {
            this.removeMarker(i);
        }
        this.alias = {};
        this.lock = false;
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


