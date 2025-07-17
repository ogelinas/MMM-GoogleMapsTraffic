
/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora (modified)
 * MIT Licensed.
 */

Module.register("MMM-GoogleMapsTraffic", {
    defaults: {
        key: '',
        lat: '',          // Provide a valid latitude (e.g., 40.7128)
        lng: '',          // Provide a valid longitude (e.g., -74.0060)
        height: '300px',
        width: '300px',
        zoom: 10,
        mapTypeId: 'roadmap',
        styledMapType: 'standard',
        disableDefaultUI: true,
        updateInterval: 900000,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        markers: [],
    },

    start: function () {
        console.log("MMM-GoogleMapsTraffic starting");
        if (this.config.key === "") {
            Log.error("MMM-GoogleMapsTraffic: key not set!");
            return;
        }

        // Request the styled map JSON from node_helper
        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });
        console.log("Sent initial notification for style:", this.config.styledMapType);

        this.updateIntervalId = setInterval(() => {
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });
            console.log("Sent periodic update notification");
        }, this.config.updateInterval);
    },

    getStyles: function () {
        return ["MMM-GoogleMapsTraffic.css"];
    },

    getDom: function () {
    
        // Reset map instance if exists
        if (this.map) {
            console.log("Resetting existing map instance");
            google.maps.event.clearInstanceListeners(this.map);
            this.map = null;
        }
    
    
        const wrapper = document.createElement("div");
        // Use a fixed id (adjust if you plan on multiple instances)
        wrapper.setAttribute("id", "map");
        wrapper.className = "GoogleMap";
        wrapper.style.height = this.config.height;
        wrapper.style.width = this.config.width;

        // Check if the Google Maps API is already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.key}&callback=initMap&libraries=places&v=weekly&loading=async`;
            script.defer = true;
            script.async = true;

            // Create a global callback that calls our module's initMap
            window.initMap = () => {
	        	console.log("Google Maps script loaded, initializing map");
                setTimeout(() => {
                	this.initMap();
                }, 100);
            };

            document.body.appendChild(script);
        } else if (typeof google !== "undefined" && google.maps) {
	    	console.log("Google Maps already loaded, initializing map");
            // If the API is already loaded, call initMap directly after a brief delay.
            setTimeout(() => {
				this.initMap();
			}, 100);
        }
        return wrapper;
    },

	initMap: function () {
        console.log("Initializing map...");
        if (!this.config.lat || !this.config.lng) {
            console.error("Invalid latitude or longitude");
            return;
        }

        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.error("Map element not found");
            return;
        }

        try {
            console.log("Creating new map instance");
    
			// const { Map } = await google.maps.importLibrary("maps");
			//const { Map } = await google.maps.importLibrary("maps");
			// const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker",);

			// this.map = new Map(document.getElementById("map"), {
            //     zoom: this.config.zoom,
            //     mapTypeId: this.config.mapTypeId,
            //     center: { lat: this.config.lat, lng: this.config.lng },
            //     styles: this.styledMapType || [],
            //     disableDefaultUI: this.config.disableDefaultUI,
            //     backgroundColor: this.config.backgroundColor,
			// 	mapId: "4504f8b37365c3d0",
			// });

			const async_map = async () => {
				const { Map } = await google.maps.importLibrary("maps");
				// const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker",);

				const map = new Map(document.getElementById("map"), {
					zoom: this.config.zoom,
					mapTypeId: this.config.mapTypeId,
					center: { lat: this.config.lat, lng: this.config.lng },
					styles: this.styledMapType || [],
					disableDefaultUI: this.config.disableDefaultUI,
					backgroundColor: this.config.backgroundColor,
					// mapId: 'DEMO_MAP_ID',
				});
				
				// const trafficLayer = new google.maps.TrafficLayer();
				// trafficLayer.setMap(map);

				// this.trafficLayer = new google.maps.TrafficLayer();
				// this.trafficLayer.setMap(null);
				// this.trafficLayer.setMap(map);

				const trafficLayer = new google.maps.TrafficLayer();
				trafficLayer.setMap(map);

				setInterval(
					() => {
						const trafficLayer = new google.maps.TrafficLayer();
						trafficLayer.setMap(null);
						trafficLayer.setMap(map);
						console.log("TrafficLayer Updated");
					},
					15 * 60 * 1000
				);


				// if (this.config.markers && Array.isArray(this.config.markers)) {

				// 	this.config.markers.forEach(marker => {

				// 		console.log("Creating marker at lat: ", marker.lat ," lng: ", marker.lng);
					
				// 		const pinGlyph = new PinElement({
				// 			background: "grey",
				// 			borderColor: 'black',
				// 			glyphColor: 'white',
				// 			scale: 0.5,
				// 		});

				// 		new AdvancedMarkerElement({
				// 			map: map,
				// 			position: {
				// 				lat: marker.lat,
				// 				lng: marker.lng,
				// 			},
				// 			content: pinGlyph.element,
				// 		});
				// 		console.log("Marker set");

				// 	});
				// }

				// if (this.config.markers && Array.isArray(this.config.markers)) {

				// 	this.config.markers.forEach(marker => {

				// 		console.log("Creating marker at lat: ", marker.lat ," lng: ", marker.lng);

				// 		new google.maps.Marker({
				// 			position: {
				// 				lat: marker.lat,
				// 				lng: marker.lng,
				// 			},
				// 			map: map,
				// 			icon: {
				// 				path: "M12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2m0-5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m-7 2.602c0-3.517 3.271-6.602 7-6.602s7 3.085 7 6.602c0 3.455-2.563 7.543-7 14.527-4.489-7.073-7-11.072-7-14.527m7-7.602c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602",
				// 				fillColor: "grey",
				// 				fillOpacity: 1,
				// 				strokeWeight: 0,
				// 				rotation: 0,
				// 				scale: 1,
				// 				anchor: new google.maps.Point(0, 20),
				// 			},
				// 		});

				// 		console.log("Marker set");

				// 	});
				// }

				return map;
			};

			
			this.map = async_map();
			
			// const trafficLayer = new google.maps.TrafficLayer();
            // trafficLayer.setMap(this.map);

            // if (this.config.markers && Array.isArray(this.config.markers)) {
            //     this.config.markers.forEach(marker => {

			// 		const async_maker = async () => {
			// 			const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker",);
			// 			console.log("Creating marker at lat: ", marker.lat ," lng: ", marker.lng);
					
			// 			const pinGlyph = new PinElement({
			// 				background: "grey",
			// 				borderColor: 'black',
			// 				glyphColor: 'white',
			// 				scale: 0.5,
			// 			});

			// 			new AdvancedMarkerElement({
			// 				map: this.map,
			// 				position: {
			// 					lat: marker.lat,
			// 					lng: marker.lng,
			// 				},
			// 				content: pinGlyph.element,
			// 			});
			// 			console.log("Marker set");
			// 		}

			// 		async_maker();

            //     });
            // }

            google.maps.event.trigger(this.map, 'resize');
            console.log("Map initialized and resize triggered");
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    },

    socketNotificationReceived: async function (notification, payload) {
        console.log("Received socket notification:", notification);
        if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
            console.log("Received style response, styledMapType length:", payload.styledMapType.length);
            this.styledMapType = payload.styledMapType;

            if (this.map) {
                console.log("Updating existing map styles");
                this.map.setOptions({ styles: this.styledMapType });
                google.maps.event.trigger(this.map, 'resize');
            } else {
                console.log("Map not initialized, updating DOM");
                this.updateDom(500);
            }
        }
    }
});
