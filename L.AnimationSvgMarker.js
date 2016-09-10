
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

    initialize: function (latlng, timestamp, options) {
        this.path = [];
        this.timeoutLoop = null;
        this.last_movement_timestamp = timestamp || 0;
        this.map = null;
        this.updateIcon();
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.on("add", function(){
            this.hideLabel();
        });
    },

    moveTo: function(destination, event_timestamp) {
        if (this.path.length == 0) {
            if (this.getLatLng().lat != destination.lat && this.getLatLng().lng != destination.lng) {
                this.last_movement_timestamp = event_timestamp;
                this.path.push(destination);
            }
        } else {
            var l = this.path.length-1;
            if (this.path[l].lat != destination.lat && this.path[l].lng != destination.lng) {
                this.last_movement_timestamp = event_timestamp;
                this.path.push(destination);
            }
        }
        if (!this.timeoutLoop) {
            this.animate();
        }

    },
    
    animate: function() {
        var self = this;
        var icon = $(self._icon);
        var shadow = $(self._shadow);
        if (self.hasOwnProperty("label")) {
            var label = $(self.label._container);
        }
        if (self.path.length > 0) {
            var point = self.path.shift();
            var pt1 = self.map.latLngToLayerPoint(point);
            self._latlng = L.latLng(point);
            icon.css("transition","transform 1.25s");
            shadow.css("transition","transform 1.25s");
            icon.css("transform", "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)");
            shadow.css("transform", "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)");
            if (self.hasOwnProperty("label")) {
                self.label._latlng = L.latLng(point);
                label.css("transition","transform 1.25s");
                label.css("transform", "translate3d(" + (pt1.x+21) + "px, " + (pt1.y-35) + "px, 0px)");
            }
            self.timeoutLoop = setTimeout(function(){
                icon.css("transition","transform 0s");
                shadow.css("transition","transform 0s");
                if (self.hasOwnProperty("label")) {
                    label.css("transition","transform 0s");
                }
                window.clearTimeout(self.timeoutLoop);
                self.timeoutLoop = null;
                self.animate();
            }, 1250);
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
        if (!this.hasOwnProperty("label")) {
            this.bindLabel(text, { noHide: true });
            this.showLabel();
        } else {
            this.label.setContent(""+text);
        }
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

    changeColor: function(color) {
        this.options.iconOptions.color = color;
        this.updateIcon();
    },

    removeFadeOut: function() {
        var self = this;
        $(self._icon).addClass("markerFadeOut");
        $(self._shadow).addClass("markerFadeOut");
        if (self.hasOwnProperty("label")) {
            $(self.label._container).addClass("markerFadeOut");
        }
        setTimeout(function(){
            if (self._map) {
                self._map.removeLayer(self);
            }
            $(self._icon).removeClass("markerFadeOut");
            $(self._shadow).removeClass("markerFadeOut");
            if (self.hasOwnProperty("label")) {
                self.hideLabel();
                $(self.label._container).removeClass("markerFadeOut");
            }
        },1000);
    },

    addToFadeIn: function(map) {
        var self = this;
        $(self._icon).addClass(".markerInvisible");
        $(self._shadow).addClass(".markerInvisible");
        self.addTo(map);
        self.map = map;
        $(self._icon).addClass("markerFadeIn");
        $(self._shadow).addClass("markerFadeIn");
        $(self._icon).removeClass(".markerInvisible");
        $(self._shadow).removeClass(".markerInvisible");
        setTimeout(function(){
            $(self._icon).removeClass("markerFadeIn");
            $(self._shadow).removeClass("markerFadeIn");
        },500);
    },

    utils: {
        /**
         * @method: convertTime
         * @arg timestamp {int}: unix timestamp (seconds)
         * @return Local timestamp
         */
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

        /**
         * @method: convertTimeUTC
         * @arg timestamp {int}: unix timestamp (seconds)
         * @return UTC timestamp
         */
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

