

// var circleOptions = {
//                     iconSize: [22, 35],
//                     // iconAnchor: [10, 18],
//                     iconAnchor: [11, 18],
//                     popupAnchor: [0, 0],
//                     viewBox: '0 0 50 50'
//                 }
//                 var r = 12  // 1.5 * 8;
//                 icon = '<svg class="shadow" width="' + circleOptions.iconSize[0] + 'px" height="' + circleOptions.iconSize[1] + 'px" viewBox="' + circleOptions.viewBox + '" version="1.1" ' 
//                      + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
//                      + '<circle cx="25" cy="25" r="'+r+'" stroke="'+this.iconOptions.color+'" stroke-width="3" fill="'+this.iconOptions.color+'" fill-opacity="0.65" /></svg>';
//                 var svgURL = "data:image/svg+xml;base64," + btoa(icon);
//                 circleOptions.iconUrl = svgURL;
//                 var mySVGIcon = L.icon( circleOptions );
//                 this.setIcon(mySVGIcon);


L.AnimationSvgMarker = L.Marker.extend({

    options: {
        time_animation_treshold: 900,
        // type: "marker",
        type: "circle",
        markerIconOptions: {
            iconAnchor: [12, 24],
            iconSize: [22, 35],
            shadowAnchor: [18, 46],
            // shadowAnchor: [22, 46],
            shadowSize: [54, 51],
            shadowUrl: "images/marker-shadow.png",
            popupAnchor: [0, -17],
            viewBox: '0 0 32 52',
            color: "#000000",
            symbol: 'M16,1 C7,1 1,7 1,15 C1,24 16,40 16,40 C16,40 31,24 31,15 C31,7 24,1 16,1 L16,1 Z'
        },
        circleIconOptions: {
            iconSize: [22, 35],
            // iconAnchor: [10, 18],
            iconAnchor: [11, 18],
            popupAnchor: [0, 0],
            viewBox: '0 0 50 50',
            radius: 12
        }
    },

    initialize: function (latlng, options) {
        this.path = [];
        this.timeoutLoop = null;
        this.last_movement_timestamp = options.timestamp || 0;
        this.options.markerIconOptions.color = options.color || "#000000";
        this.map = null;
        this._updateIcon();
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.on("add", function(){
            this.hideLabel();
        });

        this.on("click",function(){
            var self = this;
            function fadeOutClosePopup() {
                clearTimeout(self._popup.fadeTimeout);
                self._popup.fadeTimeout = setTimeout(function() {
                    self._popup._container.classList.add("markerFadeOut");
                    setTimeout(function(){
                        self.closePopup();
                        self._popup._container.classList.remove("markerFadeOut");
                    },1000);
                },5000);
            }
            fadeOutClosePopup();
            setTimeout(function(){
                self._popup._container.onmouseenter = function(){
                    clearTimeout(self._popup.fadeTimeout);
                    self._popup._container.classList.add("hover");
                }
                self._popup._container.onmouseleave = function(){
                    self._popup._container.classList.remove("hover");
                    var point = self.getLatLng();
                    var pt1 = self.map.latLngToLayerPoint(point);
                    // self._popup.setContent(self._getPopupHtml());
                    self._popup._container.style.transition = "transform 0.75s";
                    self._popup._container.style.transform  = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                    self._popup._latlng = L.latLng(point);
                    fadeOutClosePopup();
                }
            },100);
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
            // var transition_timing = " ease";
            var transition_timing = "linear";
            // var transition_timing = " ease-in-out";
            var point = self.path.shift();
            var pt1 = self.map.latLngToLayerPoint(point.location);
            self._latlng = L.latLng(point.location);
            var seconds = point.duration/1000;
            self._icon.style.transition = "transform "+seconds+"s "+transition_timing;
            self._icon.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
            if (self._shadow) {
                self._shadow.style.transition = "transform "+seconds+"s "+transition_timing;
                self._shadow.style.transform = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
            }
            // label
            if (self.hasOwnProperty("label")) {
                self.label._latlng = L.latLng(point.location);
                self.label._container.style.transition = "transform "+seconds+"s "+transition_timing;
                self.label._container.style.transform = "translate3d(" + (pt1.x+21) + "px, " + (pt1.y-35) + "px, 0px)";
            }
            // popup 
            if (self.hasOwnProperty("_popup")) {
                if (self._popup.hasOwnProperty("_container") ) {
                    var isHover = false;
                    self._popup._container.classList.forEach(function(item){
                        if (item == "hover") { isHover=true; }
                    });
                    if (!isHover) {
                        self._popup._container.style.transition = "transform "+seconds+"s "+transition_timing;
                        self._popup._container.style.transform  = "translate3d(" + pt1.x + "px, " + pt1.y + "px, 0px)";
                        self._popup._latlng = L.latLng(point);
                    }
                }
            }
            self.timeoutLoop = setTimeout(function(){
                self._icon.style.transition = "transform 0s";
                if (self._shadow) {
                    self._shadow.style.transition = "transform 0s";
                }
                if (self.hasOwnProperty("label")) {
                    self.label._container.style.transition = "transform 0s";
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
        this.label._container.classList.add("markerInvisible");
        this.label._container.classList.add("markerFadeIn");
        this.label._container.classList.remove("markerInvisible");
        setTimeout(function(){
            if (self.hasOwnProperty("label")) {
                self.label._container.classList.remove("markerFadeIn");
            }
        }, 500);
    },

    // popup
    _getPopupHtml: function() {
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

    _updateIcon: function() {
        if ("marker" == this.options.type) {
            // https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc
            // https://github.com/hiasinho/Leaflet.vector-markers/blob/master/dist/leaflet-vector-markers.js
            // here's the SVG for the marker
            var icon = '<svg class="symbol" width="' + this.options.markerIconOptions.iconSize[0] + 'px" height="' + this.options.markerIconOptions.iconSize[1] + 'px" viewBox="' + this.options.markerIconOptions.viewBox + '" version="1.1" ' 
                     + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                     + '<path d="' + this.options.markerIconOptions.symbol + '" fill="' + this.options.markerIconOptions.color + '" stroke="' + this.options.markerIconOptions.color + '" fill-opacity="0.65" stroke-width="3"></path></svg>';            
            this.options.markerIconOptions.html = icon;
            this.options.markerIconOptions.className = 'svgIcon';
            // var myIcon = new DivIconWithShadow(this.options.markerIconOptions);
            var myIcon = new L.DivIcon(this.options.markerIconOptions);
            this.setIcon(myIcon);
        }

        if ("circle" == this.options.type) {
            icon = '<svg class="symbol" width="' + this.options.circleIconOptions.iconSize[0] + 'px" height="' + this.options.circleIconOptions.iconSize[1] + 'px" viewBox="' + this.options.circleIconOptions.viewBox + '" version="1.1" ' 
                 + 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                 + '<circle cx="25" cy="25" r="'+this.options.circleIconOptions.radius+'" stroke="'+this.options.circleIconOptions.color+'" stroke-width="3" fill="'+this.options.circleIconOptions.color+'" fill-opacity="0.65" /></svg>';
            var svgURL = "data:image/svg+xml;base64," + btoa(icon);
            this.options.circleIconOptions.html = icon;
            this.options.circleIconOptions.className = 'svgIcon';
            var myIcon = new L.DivIcon(this.options.circleIconOptions);
            this.setIcon(myIcon);
        }

    },

    setProperties: function(properties) {
        this.properties = properties;
        if (this.hasOwnProperty("_popup")) {
            this._popup.setContent(this._getPopupHtml());
        } else {
            this.bindPopup(this._getPopupHtml());
        }
    },

    changeColor: function(color, duration) {
        var self = this;
        // stroke
        // fill
        
        // self._icon.style.transition = "all "+duration+"s linear";
        // self._icon.getElementsByTagName("svg")[0].style.stroke = color;
        // self._icon.getElementsByTagName("svg")[0].style.fill = color;

        d3.select(self._icon.getElementsByTagName("circle")[0]).transition().duration(duration||1000).style("fill",  color).style("stroke",color);

        return;

        if (d3) {
            var step = duration || 1000;
            step = step/10;
            var color_scale;
            if ("4" == d3.version[0]){
                color_scale = d3.scaleLinear()
                    .domain([0, 9])
                    .range([this.options.markerIconOptions.color, color]);   
            } else if ("3" == d3.version[0]) {
                color_scale = d3.scale.linear()
                    .domain([0, 9])
                    .range([this.options.markerIconOptions.color, color]);
            }
            function update(n) {
                setTimeout(function(){
                    if (n<10) {
                        self.options.markerIconOptions.color = color_scale(n);
                        this.options.circleIconOptions.color = color_scale(n);
                        self._updateIcon(); 
                        update(n+1);
                    }             
                }, step);
            }
            update(1);
        } else {
            this.options.markerIconOptions.color = color;
            this.options.circleIconOptions.color = color;
            this._updateIcon();
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
        self._icon.classList.add("markerFadeIn");
        self._icon.classList.remove("markerInvisible");
        if (self._shadow) {
            self._shadow.classList.add("markerInvisible");
            self._shadow.classList.add("markerFadeIn");
            self._shadow.classList.remove("markerInvisible");
        }
        setTimeout(function(){
            self._icon.classList.remove("markerFadeIn");

            if (self._shadow) {
                self._shadow.classList.remove("markerFadeIn");
            }
        }, duration);
    },

    removeFadeOut: function(milliseconds) {
        var duration = milliseconds || 1000;
        var self = this;
        self._icon.classList.add("markerFadeOut");
        if (self._shadow) {
            self._shadow.classList.add("markerFadeOut");
        }
        if (self.hasOwnProperty("label")) {
            self.label._container.classList.add("markerFadeOut");
        }
        setTimeout(function(){
            self._icon.classList.remove("markerFadeOut");
            if (self._shadow) {
                self._shadow.classList.remove("markerFadeOut");
            }
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
        },

        /**
         * Returns a random integer between min (inclusive) and max (inclusive)
         * Using Math.round() will give you a non-uniform distribution!
         */
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        getDelay: function(x) {var n=(-30*x)+150; return n;}

    }


});


L.animationsvgmarker = function(latlng, timestamp) {
    return new L.AnimationSvgMarker(latlng, timestamp);
};






// http://bl.ocks.org/zross/9c0452908dcf6d040894

DivIconWithShadow = L.DivIcon.extend({

    _createImg: function (src, el) {
        el = el || document.createElement('img');
        el.src = src;
        return el;
    },

    _getIconUrl: function (name) {
        return this.options[name + 'Url'];
    },

    createShadow: function () {
        var src = "images/marker-shadow.png";
        var img = this._createImg(src);
        this._setIconStyles(img, 'shadow');
        return img;
    },

    _setIconStyles: function (img, name) {
        var options = this.options,
            size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
            anchor;

        if (name === 'shadow') {
            anchor = L.point(options.shadowAnchor || options.iconAnchor);
        } else {
            anchor = L.point(options.iconAnchor);
        }

        if (!anchor && size) {
            anchor = size.divideBy(2, true);
        }

        img.className = 'awesome-marker-' + name + ' ' + options.className;

        if (anchor) {
            img.style.marginLeft = (-anchor.x) + 'px';
            img.style.marginTop  = (-anchor.y) + 'px';
        }

        if (size) {
            img.style.width  = size.x + 'px';
            img.style.height = size.y + 'px';
        }
    }


});



