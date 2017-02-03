
L.AnimationSvgMarker = L.Marker.extend({

    options: {
        type: "circle",
        color: "#000000",
        transition_timing: "linear"
    },

    markerIconOptions: {
        iconAnchor: [12, 24],
        iconSize: [22, 35],
        shadowAnchor: [18, 46],
        shadowSize: [54, 51],
        popupAnchor: [0, -17],
        viewBox: '0 0 32 52',
        color: "#000000",
        symbol: 'M16,1 C7,1 1,7 1,15 C1,24 16,40 16,40 C16,40 31,24 31,15 C31,7 24,1 16,1 L16,1 Z'
    },

    circleIconOptions: {
        iconSize: [22, 35],
        iconAnchor: [11, 18],
        popupAnchor: [0, 0],
        viewBox: '0 0 50 50',
        radius: 12,
        color: "#000000"
    },

    initialize: function (latlng, options) {
        L.Util.setOptions(this, options);
        this.path = [];
        this.timeoutLoop = null;
        
        // set default colors
        this.markerIconOptions.color = options.color || "#000000";
        this.circleIconOptions.color = options.color || "#000000";
        this.color = options.color || "#000000";

        this._map = null;
        this._colorLock = false;
        this._updateIcon();

        // set stylesheet
        this._stylesheet = document.createElement('style');
        this._stylesheet.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(this._stylesheet);

        L.Marker.prototype.initialize.call(this, latlng, options);
        this.on("add", function(){
            this.hideLabel();
        });

        this.on("click",function(){
            var self = this;
            console.log("click");
            function fadeOutClosePopup() {
                clearTimeout(self._popup.fadeTimeout);
                self._popup.fadeTimeout = setTimeout(function() {
                    self._popup._container.classList.add("markerFadeOut");
                    setTimeout(function(){
                        self.closePopup();
                        self._popup._container.classList.remove("markerFadeOut");
                    },1000);
                },8000);
            }
            setTimeout(function(){
                self._popup._container.onmouseenter = function(){
                    clearTimeout(self._popup.fadeTimeout);
                    self._popup._container.classList.add("hover");
                }
                self._popup._container.onmouseleave = function(){
                    self._popup._container.classList.remove("hover");
                    var point = self.getLatLng();
                    var pt1 = self._map.latLngToLayerPoint(point);
                    self._popup._container.style.transition = "transform 0.75s";
                    self._popup._container.style.transform  = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                    self._popup._latlng = L.latLng(point);
                }
            },100);
        });

    },

    setStylesheet: function(css) {
        this._stylesheet.innerHTML = css;
    },

    moveTo: function(destination, milliseconds) {
        if (!milliseconds) {
            milliseconds = 1000;
        }
        if (this.path.length == 0) {
            if (this.getLatLng().lat != destination.lat || this.getLatLng().lng != destination.lng) {
                this.path.push({location:destination, duration:milliseconds});
            }
        } else {
            var l = this.path.length-1;
            if (this.path[l].lat != destination.lat || this.path[l].lng != destination.lng) {
                this.path.push({location:destination, duration:milliseconds});
            }
        }
        if (!this.timeoutLoop) {
            this.animate();
        }
    },

    animate: function() {
        var self = this;

        // TESTING
        //this.animate_path();
        //return;

        if (self.path.length > 0) {
            var point = self.path.shift();
            // removed from map
			if (!self._map){return;}
            var pt1 = self._map.latLngToLayerPoint(point.location);
            self._latlng = L.latLng(point.location);
            var seconds = point.duration/1000;
            self._icon.style.transition = "transform "+seconds+"s "+this.options.transition_timing;
            self._icon.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
            // popup 
            if (self.hasOwnProperty("_popup")) {
                if (self._popup.hasOwnProperty("_container") ) {
                    var isHover = false;
                    for (var i=0; i < self._popup._container.classList.length; i++) {
                        if (self._popup._container.classList[i] == "hover") { 
                            isHover=true; 
                        }
                    };
                    if (!isHover) {
                        self._popup._container.style.transition = "transform "+seconds+"s "+this.options.transition_timing;
                        self._popup._container.style.transform  = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                        self._popup._latlng = L.latLng(point);
                    }
                }
            }

            self.timeoutLoop = setTimeout(function(){
                if (self._icon) {
                    self._icon.style.transition = "transform 0s";
                }
                if (self.hasOwnProperty("_popup")) {
                    if (self._popup.hasOwnProperty("_container")) {
                        self._popup._container.style.transition = "transform 0s";
                    }
                }
                window.clearTimeout(self.timeoutLoop);
                self.timeoutLoop = null;
                self.animate();
            }, point.duration);
        } else {
            window.clearTimeout(self.timeoutLoop);
            self.timeoutLoop = null;
        }
    },

    // popup
    _getPopupHtml: function() {
        var popup_content = "<div class='popup_container'>";
        for (var f in this.properties) {
            popup_content += "<label>" + f + "</label>: <span column_id='"+f+"'>" + this.properties[f] + "</span><br>";
        }
        popup_content += "</div>";
        return popup_content;
    },

    _updateIcon: function() {
        if ("marker" == this.options.type) {
            // https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc
            // https://github.com/hiasinho/Leaflet.vector-markers/blob/master/dist/leaflet-vector-markers.js
            // here's the SVG for the marker
            var icon = '<svg class="symbol shadow" width="' + this.markerIconOptions.iconSize[0] + 'px" height="' + this.markerIconOptions.iconSize[1] + 'px" viewBox="' + this.markerIconOptions.viewBox + '" version="1.1" ' 
                     + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                     + '<path d="' + this.markerIconOptions.symbol + '" fill="' + this.markerIconOptions.color + '" stroke="' + this.markerIconOptions.color + '" fill-opacity="0.65" stroke-width="3"></path></svg>';            
            //this.markerIconOptions.html = icon;
            this.markerIconOptions.html = icon + '<span class="markerLabel markerInvisible"></span>';
            this.markerIconOptions.className = 'svgIcon';
            var myIcon = new L.DivIcon(this.markerIconOptions);
            this.setIcon(myIcon);
        }

        if ("circle" == this.options.type) {
            icon = '<svg class="symbol shadow" width="' + this.circleIconOptions.iconSize[0] + 'px" height="' + this.circleIconOptions.iconSize[1] + 'px" viewBox="' + this.circleIconOptions.viewBox + '" version="1.1" ' 
                 + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                 + '<circle cx="25" cy="25" r="'+this.circleIconOptions.radius+'" stroke="'+this.circleIconOptions.color+'" stroke-width="3" fill="'+this.circleIconOptions.color+'" fill-opacity="0.65" /></svg>';
            var svgURL = "data:image/svg+xml;base64," + btoa(icon);
            //this.circleIconOptions.html = icon;
            this.circleIconOptions.html = icon + '<span class="markerLabel markerInvisible"></span>';
            this.circleIconOptions.className = 'svgIcon';
            var myIcon = new L.DivIcon(this.circleIconOptions);
            this.setIcon(myIcon);
        }

    },

    setProperties: function(properties) {
        this.properties = properties;
		if (this.hasOwnProperty("_popup")) {
			if (this._popup._isOpen) {
		        for (var f in this.properties) {
		        	$(this._popup._container).find('span[column_id="'+f+'"]').text(this.properties[f]);
		        }
			}
		} else {
			this.bindPopup(this._getPopupHtml());
		}
    },

    changeColor: function(color, duration) {
        var self = this;
        // check for same color
        if (this._colorLock) {this._colorPending = [color, duration];}
        if (color == this.color) { return; }
        duration = duration || 1000;
        this._colorLock = true;
        if (self._icon) {
            this.color = color;
            var seconds = duration/1000;
            var svgElem = self._icon.getElementsByTagName("circle");
            if (0 == svgElem.length) {
                svgElem = self._icon.getElementsByTagName("path")
            }
            svgElem[0].style.transition = "stroke "+seconds+"s ease, "+"fill "+seconds+"s ease";
            svgElem[0].setAttribute("stroke", color);
            svgElem[0].setAttribute("fill", color);
        }

        setTimeout(function(){
            self._colorLock = false;
            if (self._colorPending) {
                self.changeColor( self._colorPending[0], self._colorPending[1] );
                self._colorPending = null;
            }
        }, duration);
    },

    addToFadeIn: function(map, milliseconds) {
        var self = this;
        var duration = milliseconds || 500;
        self.addTo(map);
        self._map = map;
		self.hideLabel();
        self._icon.classList.add("markerInvisible");
        self._icon.classList.add("markerFadeIn");
        self._icon.classList.remove("markerInvisible");
        setTimeout(function(){
            if (self._icon) {
                self._icon.classList.remove("markerFadeIn");
            }
        }, duration);
    },

	showFadeIn: function(milliseconds) {
        var self = this;
        var duration = milliseconds || 500;
		self.hideLabel();
        self._icon.classList.add("markerInvisible");
        self._icon.classList.add("markerFadeIn");
        self._icon.classList.remove("markerInvisible");
        setTimeout(function(){
            if (self._icon) {
                self._icon.classList.remove("markerFadeIn");
            }
        }, duration);
    },


    removeFadeOut: function(milliseconds) {
        var duration = milliseconds || 1000;
        var self = this;
        if (self._icon) {
            self._icon.classList.add("markerFadeOut");
        }
		self.hideLabel();
        setTimeout(function(){
            self._icon.classList.remove("markerFadeOut");
            if (self._map) {
                self._map.removeLayer(self);
            }
            clearTimeout(self.timeoutLoop);
            self.path = [];
        }, duration);
    },

	hideFadeOut: function(milliseconds) {
        var duration = milliseconds || 1000;
        var self = this;
		if (this._icon) {
			this._icon.classList.add("markerFadeOut");
		}
		self.hideLabel();
		setTimeout(function(){
			if (self.hasOwnProperty("_popup")) {
				if (self._popup._isOpen) {
					self.closePopup();
				}
			}
			self._icon.classList.remove("markerFadeOut");
			self._icon.classList.add("markerInvisible");
			window.clearTimeout(self.timeoutLoop);
			self.timeoutLoop = null;
			self.path = [];
		}, duration);
	},

	setlabelContent: function(text) {
		if (text != this._icon.getElementsByTagName("span")[0].innerText) {
			this._icon.getElementsByTagName("span")[0].innerText = text;
		}
	},
	
	showLabel: function(milliseconds) {
		if ( -1 == this._icon.getElementsByTagName("span")[0].classList.value.indexOf("markerInvisible") ) {
			return;
		}
		var self = this;
		var duration = milliseconds || 1000;
		this._icon.getElementsByTagName("span")[0].classList.add("markerInvisible");
		this._icon.getElementsByTagName("span")[0].classList.add("markerFadeIn");
		this._icon.getElementsByTagName("span")[0].classList.remove("markerInvisible");
        setTimeout(function(){
			self._icon.getElementsByTagName("span")[0].classList.remove("markerFadeIn");
        }, duration);
	},
	
	hideLabel: function(milliseconds) {
		if ( -1 != this._icon.getElementsByTagName("span")[0].classList.value.indexOf("markerInvisible") ) {
			return;
		}
		var self = this;
		var duration = milliseconds || 1000;
		this._icon.getElementsByTagName("span")[0].classList.add("markerFadeOut");
		setTimeout(function(){
			self._icon.getElementsByTagName("span")[0].classList.add("markerInvisible");
			self._icon.getElementsByTagName("span")[0].classList.remove("markerFadeOut");
		}, duration);
	},



    animate_path: function() {
        var self = this;
        // get function start time
        var start_time = new Date();
        // check if marker has been removed from map
        if (!self._map){return;}
        // get current path length
        var n = self.path.length;
        if (n > 0) {
            // loop through path array
            // calculate variables for animation frame
            var total_runtime = 0;
            var positions = [];
            for (var i=0; i < n; i++) {
                // slice points out of path queue
                var point = self.path.shift();
                // calculate animation runtime
                point.duration = (point.duration/1000);
                total_runtime += point.duration;
                // if last item set marker latLng to location
                if (i == n-1) {
                    self._latlng = L.latLng(point.location);
                }
                // store point in positions array
                positions.push(point);
            }

            // form a single animation frame
            var total_playtime = 0;
            var keyFrames = '@keyframes AnimationSvgMarker_'+this._leaflet_id+' {\n';
            for (var i in positions) {
                total_playtime += positions[i].duration;
                frame_time = parseInt(total_playtime/total_runtime*100);
                var pt1 = self._map.latLngToLayerPoint(positions[i].location);
                keyFrames += frame_time+'% { transform: translate3d(' + pt1.x + 'px, ' + pt1.y + 'px, 0px); }\n';
            }
            keyFrames += '}';

            // set marker style sheet
            self.setStylesheet(keyFrames);
            self._icon.style.animation = 'AnimationSvgMarker_'+this._leaflet_id+' '+total_runtime+'s 1';  // this.options.transition_timing

/*
            // popup 
            if (self.hasOwnProperty("_popup")) {
                if (self._popup.hasOwnProperty("_container") ) {
                    var isHover = false;
                    for (var i=0; i < self._popup._container.classList.length; i++) {
                        if (self._popup._container.classList[i] == "hover") { 
                            isHover=true; 
                        }
                    };
                    if (!isHover) {
                        self._popup._container.style.transition = "transform "+seconds+"s "+this.options.transition_timing;
                        self._popup._container.style.transform  = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                        self._popup._latlng = L.latLng(point);
                    }
                }
            }
*/

            var end_time = new Date();
            self.timeoutLoop = setTimeout(function(){
                var pt1 = self._map.latLngToLayerPoint(self._latlng);
                self._icon.style.transition = "transform 0s "+self.options.transition_timing;
                self._icon.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                //if (self._icon) {
                //    self._icon.style.transition = "transform 0s";
                //}
                if (self.hasOwnProperty("_popup")) {
                    if (self._popup.hasOwnProperty("_container")) {
                        self._popup._container.style.transition = "transform 0s";
                    }
                }
                window.clearTimeout(self.timeoutLoop);
                self.timeoutLoop = null;
                self.animate();
            }, total_runtime+(end_time-start_time));

        } else {
            window.clearTimeout(self.timeoutLoop);
            self.timeoutLoop = null;
        }
    }



});


L.animationsvgmarker = function(latlng, options) {
    return new L.AnimationSvgMarker(latlng, options);
};



/*



var keyFrames = '\
@keyframes markerAnimation {\
    10% {\
        transform: translate3d(386px, 347px, 0px);\
    }\
    30% {\
        transform: translate3d(386px, 347px, 0px);\
    }\
    60% {\
       transform:  translate3d(406px, 307px, 0px);\
    }\
    90% {\
        transform: translate3d(306px, 347px, 0px);\
    }\
}';
marker.setStylesheet(keyFrames);
marker._icon.style.animation = "markerAnimation 1.25s 1";






*/
