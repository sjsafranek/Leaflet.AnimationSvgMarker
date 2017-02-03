
// https://code.tutsplus.com/articles/data-structures-with-javascript-stack-and-queue--cms-23348
function Queue() {
    this._oldestIndex = 1;
    this._newestIndex = 1;
    this._storage = {};
}
 
Queue.prototype.size = function() {
    return this._newestIndex - this._oldestIndex;
};

Queue.prototype.isEmpty = function() {
	return 0 == this.size();
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
		self = this;
        this.alias = {};
        this.queue = new Queue();
        this.updateQueue = new Queue();
        this.lock = false;
		this.show = true;
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

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
		
		var self = this;
		this._map.on('popupopen', function (e) {
			var source = e.popup._source;
			if (self._layers.hasOwnProperty(source._leaflet_id)) {
				source._popup.setContent( 
					source._getPopupHtml() 
				);
			}
		});
	},

    size: function() {
        return {
            "layers": Object.keys(this._layers).length,
            "active": Object.keys(this.alias).length,
            "queue": this.queue.size()
        }
    },

    processUpdateQueue: function() {
        if (this.lock) {
			setTimeout(this.processUpdateQueue, 50);
			return;
		}        
		if (this.updateQueue.size() != 0) {
			var data = this.updateQueue.dequeue();
			this.addMarker(data.key, data.latLng, data.options);
		}
    },

    addMarker: function(key, latLng, options) {
        var self = this;
        
        if (!this.show) {
			return;
		}
        
        if (this.lock) {
            self.updateQueue.enqueue({
				"key": key, 
				"latLng": latLng, 
				"options": options
			});
            self.processUpdateQueue();
            return;
        }

		var marker = this.getMarker(key);
		if (marker) {
            //marker._icon.classList.remove("markerInvisible");
            marker.showFadeIn();
            return;
        } 
       
        else if (this.queue.isEmpty()) {
            // create new layer
            var lyr = L.animationsvgmarker(latLng, options);
            var id = this.getLayerId(lyr);
            lyr.addToFadeIn(this._map);

            // on map remove listener
            lyr.on("remove", function(event) {
                self.lock = true;
                try { 
                    self.removeLayer(this); 
                }
                catch(err){
                    var id = this._leaflet_id;
                    delete self._layers[id];
                }
                for (var i in self.alias) {
                    if (self.alias[i] == id) {
                        delete self.alias[i];
                    }
                }
                self.lock = false;
            });

            this.addLayer(lyr);
            this.alias[key] = id;
            return this._layers[this.alias[key]];

        } 
        
        else {
			// get layer id from quee
			var id = this.getLayerIdFromQueue();
			
			// if `id` is null
			if (!id) {
				this.addMarker(key, latLng, options);
			}
		
            // assign layer id to lookup table
            this.alias[key] = id;

            // set marker latlng
            this._layers[id].setLatLng(latLng);
            
			// fade marker in
            this._layers[id].showFadeIn();

            // return recycled marker
            return this._layers[id];
        }
    },

	getLayerIdFromQueue: function() {
		// Grab `id` from queue
		var id = this.queue.dequeue();

		// Check if layer `id` is valid
		while (!this._layers.hasOwnProperty(id)) {
			
			// check if queue is empty
			if (this.queue.isEmpty()) {
				return null;
			}
			
			// Grab new `id` from queue
			id = this.queue.dequeue();
		}

		return id;
	},

	hasMarker: function(key) {
		// Check if layer has allocated marker alias 
		return this.alias.hasOwnProperty(key);
	},

	getLayerIdByKey: function(key) {
		// Get layer_id from key
		if (this.hasMarker(key)) {
			return this.alias[key];
		}
		return null
	},

    getMarker: function(key) {
		// Get marker from layer
		var id = this.getLayerIdByKey(key);
		if (id) {
			return this._layers[id];
		}
		return null;
    },

    removeMarker: function(key) {
        var self = this;
        if (this.hasMarker(key)) {
            var id = this.alias[key];
            delete this.alias[key];
			this._layers[id].hideFadeOut();
            setTimeout(function(){
				if (self._layers.hasOwnProperty(id)) {
					self.queue.enqueue(id);
				}
            }, 1000);

        }
    },

    destroyMarker: function(key) {
        var self = this;
        if (this.hasMarker(key)) {
            var id = this.alias[key];
            delete this.alias[key];
            this._layers[id].removeFadeOut();
            setTimeout(function(){
                self.removeLayer(id);
            }, 10);
        }
    },

    clearAllMarkers: function() {
        this.lock = true;
        for (var i in this.alias) {
            this.removeMarker(i);
        }
        this.alias = {};
        this.lock = false;
    },

    destroyAllMarkers: function() {
        var self = this
        this.lock = true;

		for (var i in this._layers) {
			if (this._layers.hasOwnProperty(i)) {
				this.removeLayer(i);
			}
		}
		
        this.alias = {};
        setTimeout(function(){
            self.lock = false;
        },1250);

    }

});

