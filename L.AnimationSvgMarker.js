
L.AnimationSvgMarker = L.Marker.extend({

    options: {
        time_animation_treshold: 900,
        iconOptions: {
            iconSize: [22, 35],
            iconAnchor: [12, 24],
            shadowSize: [54, 51],
            shadowUrl: "leaflet-0.7.7-patch/images/marker-shadow.png",
            shadowAnchor: [18, 45],
            popupAnchor: [0, -17],
            viewBox: '0 0 32 52',
            color: "#000000"
        }
    },

    initialize: function (latlng, options) {
        this.path = [];
        this.timeoutLoop = null;
        this.last_movement_timestamp = options.timestamp || 0;
        this.options.iconOptions.color = options.color || "#000000";
        this.map = null;
        this.updateIcon();
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.on("add", function(){
            this.hideLabel();
        });
    },

    moveTo: function(destination, milliseconds, event_timestamp) {
        if (!milliseconds) {
            milliseconds = 1000;
        }
        if (this.path.length == 0) {
            if (this.getLatLng().lat != destination.lat && this.getLatLng().lng != destination.lng) {
                this.last_movement_timestamp = event_timestamp || this.last_movement_timestamp+1;
                this.path.push({location:destination, duration:milliseconds});
            }
        } else {
            var l = this.path.length-1;
            if (this.path[l].lat != destination.lat && this.path[l].lng != destination.lng) {
                this.last_movement_timestamp = event_timestamp || this.last_movement_timestamp+1;
                this.path.push({location:destination, duration:milliseconds});
            }
        }
        if (!this.timeoutLoop) {
            this.animate();
        }

    },
    
    animate: function() {
        var self = this;
        if (self.path.length > 0) {
            var point = self.path.shift();
            var pt1 = self.map.latLngToLayerPoint(point.location);
            self._latlng = L.latLng(point.location);
            var seconds = point.duration/1000;
            self._icon.style.transition = "transform "+seconds+"s";
            self._shadow.style.transition = "transform "+seconds+"s";
            self._icon.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
            self._shadow.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
            if (self.hasOwnProperty("label")) {
                self.label._latlng = L.latLng(point.location);
                self.label._container.style.transition = "transform "+seconds+"s";
                self.label._container.style.transform = "translate3d(" + (pt1.x+21) + "px, " + (pt1.y-35) + "px, 0px)";
            }
            self.timeoutLoop = setTimeout(function(){
                self._icon.style.transition = "transform 0s";
                self._shadow.style.transition = "transform 0s";
                if (self.hasOwnProperty("label")) {
                    self.label._container.style.transition = "transform 0s";
                }
                window.clearTimeout(self.timeoutLoop);
                self.timeoutLoop = null;
                self.animate();
            }, point.duration);
        }
        else {
            // if ($("#timecontrol-slider").slider("option", "value") - self.last_movement_timestamp > self.time_animation_treshold) {
            //     if (self.map.hasLayer(self)) {
            //         self.removeFadeOut();
            //         window.clearTimeout(self.timeoutLoop);
            //         self.timeoutLoop = null;
            //         return;
            //     }
            // }
        }
    },

    updateLabel: function(text) {
        var self = this;
        if (!this.hasOwnProperty("label")) {
            this.bindLabel(text, { noHide: true });
            this.showLabel();
        } else {
            this.label.setContent(""+text);
            this.showLabel();
        }
        // this.label._container.classList.add("markerInvisible");
        // this.label._container.classList.add("markerFadeIn");
        // this.label._container.classList.remove("markerInvisible");
        // setTimeout(function(){
        //     if (self.hasOwnProperty("label")) {
        //         self.label._container.classList.remove("markerFadeIn");
        //     }
        // },500);
    },

    // popup
    getPopupHtml: function() {
        var popup_content = "<div class='popup_container'>";
        if (this.properties.hasOwnProperty("event_timestamp")) {
            popup_content += "<label>time</label>: " + this.utils.convertTime(this.properties.event_timestamp) + "<br>";
        }
        for (var f in this.properties) {
            popup_content += "<label>" + f + "</label>: " + this.properties[f] + "<br>";
        }
        popup_content += "</div>";
        return popup_content;
    },

    updateIcon: function() {
        // https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc
        // https://github.com/hiasinho/Leaflet.vector-markers/blob/master/dist/leaflet-vector-markers.js
        var mapPin = 'M16,1 C7,1 1,7 1,15 C1,24 16,40 16,40 C16,40 31,24 31,15 C31,7 24,1 16,1 L16,1 Z';
        // https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc
        // here's the SVG for the marker
        var icon = '<svg class="shadow" width="' + this.options.iconOptions.iconSize[0] + 'px" height="' + this.options.iconOptions.iconSize[1] + 'px" viewBox="' + this.options.iconOptions.viewBox + '" version="1.1" ' 
                 + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                 + '<path d="' + mapPin + '" fill="' + this.options.iconOptions.color + '" stroke="' + this.options.iconOptions.color + '" fill-opacity="0.65" stroke-width="3"></path></svg>';
        // here's the trick, base64 encode the URL
        var svgURL = "data:image/svg+xml;base64," + btoa(icon);
        this.options.iconOptions.iconUrl = svgURL;
        var mySVGIcon = L.icon( this.options.iconOptions );
        this.setIcon(mySVGIcon);
    },

    setProperties: function(properties) {
        this.properties = properties;
        this.bindPopup(this.getPopupHtml());
    },

    changeColor: function(color, duration) {
        var self = this;
        if (d3) {
            var step = duration || 1000;
            step = step/10;
            var color_scale;
            if ("4" == d3.version[0]){
                color_scale = d3.scaleLinear()
                    .domain([0, 9])
                    .range([this.options.iconOptions.color, color]);   
            } else if ("3" == d3.version[0]) {
                color_scale = d3.scale.linear()
                    .domain([0, 9])
                    .range([this.options.iconOptions.color, color]);
            }
            function update(n) {
                setTimeout(function(){
                    if (n<10) {
                        self.options.iconOptions.color = color_scale(n);
                        self.updateIcon(); 
                        update(n+1);
                    }             
                }, step);
            }
            update(1);
        } else {
            this.options.iconOptions.color = color;
            this.updateIcon();
        }
    },

    addToFadeIn: function(map, milliseconds) {
        var self = this;
        var duration = milliseconds || 500;
        self.addTo(map);
        self.map = map;
        if (self.hasOwnProperty("label")) {
            self.hideLabel();
        }
        self._icon.classList.add("markerInvisible");
        self._shadow.classList.add("markerInvisible");
        self._icon.classList.add("markerFadeIn");
        self._shadow.classList.add("markerFadeIn");
        self._icon.classList.remove("markerInvisible");
        self._shadow.classList.remove("markerInvisible");
        setTimeout(function(){
            self._icon.classList.remove("markerFadeIn");
            self._shadow.classList.remove("markerFadeIn");
        }, duration);
    },

    removeFadeOut: function(milliseconds) {
        var duration = milliseconds || 1000;
        var self = this;
        self._icon.classList.add("markerFadeOut");
        self._shadow.classList.add("markerFadeOut");
        if (self.hasOwnProperty("label")) {
            self.label._container.classList.add("markerFadeOut");
        }
        setTimeout(function(){
            self._icon.classList.remove("markerFadeOut");
            self._shadow.classList.remove("markerFadeOut");
            if (self._map) {
                self._map.removeLayer(self);
            }
            if (self.hasOwnProperty("label")) {
                self.hideLabel();
                self.label._container.classList.remove("markerFadeOut");
            }
        }, duration);
    },

    utils: {

        convertTime: function(timestamp) {
            var TIME = new Date( timestamp * 1000 );
            // Left pad w/ 0's
            var d = ("0" + (TIME.getMonth()+1)).slice(-2) + "/" 
                  + ("0" + TIME.getDate()).slice(-2) + "/" 
                  + TIME.getFullYear() + " " 
                  + ("0" + TIME.getHours()).slice(-2) + ":" 
                  + ("0" + TIME.getMinutes()).slice(-2) +  ":" 
                  + ("0" + TIME.getSeconds()).slice(-2);
            return d;
        },

        convertTimeUTC: function(timestamp) {
            var TIME = new Date( timestamp * 1000 );
            // Left pad w/ 0's
            var d = ("0" + (TIME.getUTCMonth()+1)).slice(-2) + "/" 
                  + ("0" + TIME.getUTCDate()).slice(-2) + "/" 
                  + TIME.getUTCFullYear() + " " 
                  + ("0" + TIME.getUTCHours()).slice(-2) + ":" 
                  + ("0" + TIME.getUTCMinutes()).slice(-2) +  ":" 
                  + ("0" + TIME.getUTCSeconds()).slice(-2);
            return d;
        }

    }


});


L.animationsvgmarker = function(latlng, timestamp) {
    return new L.AnimationSvgMarker(latlng, timestamp);
};

