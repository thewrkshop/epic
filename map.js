/* epic-map mapbox */
if(typeof epic !== "object") {var epic = {}}
epic.map = {
	options: {
		map: {
			style: "mapbox://styles/mapbox/streets-v11",
			center: {lng: -2.360000, lat: 51.380001},
			zoom: 4,
		},
		marker: {
			color: "#ee3c49",
		},
		popup: {
			focusAfterOpen: false,
			closeButton: false,
		}
	},
	x: {x: "epic-map-"},
	instances: {},
	initAttrs: () => {
		epic.map.x.el = epic.map.x.x + "element";
		epic.map.x.ops = epic.map.x.x + "options";
		epic.map.x.con = "[" + epic.map.x.el + "='container']";
		epic.map.x.map = "[" + epic.map.x.el + "='map']";
		epic.map.x.lst = "[" + epic.map.x.el + "='list']";
		epic.map.x.itm = "[" + epic.map.x.el + "='item']";
		epic.map.x.dta = "[" + epic.map.x.el + "='data']";
		epic.map.x.mrk = "[" + epic.map.x.el + "='marker']";
		epic.map.x.pop = "[" + epic.map.x.el + "='popup']";
	},
	getInst: (id) => {
		if(typeof id !== "string") {return}
		if(!epic.map.instances.hasOwnProperty(id)) {return}
		return epic.map.instances[id];
	},
	getItem: (id, itemId) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		if(typeof itemId !== "string") {return}
		if(!inst.items.hasOwnProperty(itemId)) {return}
		return inst.items[itemId];
	},
	onHover: (id, itemId, target, state) => {
		let inst = epic.map.getInst(id);
		let item = epic.map.getItem(id, itemId);
		if(!item || !item) {return}
		/* markers */
		if(target.toLowerCase() === "marker") {
			if(item.mdata.hover === null || item.mdata.hover === "") {return}
			if(typeof state !== "boolean") {return}
			let hex = item.mdata.type, cls = "removeClass";
			if(state) {hex = item.mdata.hover; cls = "addClass"}
			if(item.mdata.hover.charAt(0) === "#") {
				item.marker._element.style.color = hex;
			}
			else if(item.mdata.hover === "popup") {
				if(state) {item.popup.addTo(inst.map)}
				else {item.popup.remove()}
			}
			else {
				$(item.marker._element)[cls](item.mdata.hover);
			}
		}
	},
	updateMarkers: (id) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		let bounds = false;
		epic.map.instances[id].bounds = new mapboxgl.LngLatBounds();
		for(itemId in inst.items) {
			let item = inst.items[itemId];
			if(item.marker === false) {continue}
			if(item.hasOwnProperty("popup") && item.popup.hasOwnProperty("remove")) {
				item.popup.remove();
			}
			if(inst.activeItems.includes(itemId)) {
				item.marker._element.style.removeProperty("display");
				epic.map.instances[id].bounds.extend([item.lng, item.lat]);
				bounds = true;
			}
			else {item.marker._element.style.display = "none"}
		}
		if(bounds) {inst.map.fitBounds(epic.map.instances[id].bounds, {padding: 64, maxZoom: 16})}
	},
	initFilters: (id) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		window.fsAttributes = window.fsAttributes || [];
		window.fsAttributes.push([
			"cmsfilter",
			(filterInstances) => {
				filterInstances.forEach((filterInstance) => {
					let list = filterInstance.listInstance.list;
					filterInstance.listInstance.on("renderitems", (renderedItems) => {
						let listId = $(list).attr(epic.map.x.x + "id");
						if(listId === id) {
							epic.map.instances[id].activeItems = [];
							renderedItems.forEach((item) => {
								epic.map.instances[id].activeItems.push($(item.element).attr(epic.map.x.x + "id"));
							});
							epic.map.updateMarkers(id);
						}
					});
				});
			}
		]);
	},
	initMarker: (id, itemId) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		let item = epic.map.getItem(id, itemId);
		if(!item || !item.lng || !item.lat) {return}
		epic.map.instances[id].items[itemId].marker = new mapboxgl.Marker(item.mdata.options)
			.setLngLat([item.lng, item.lat])
			.addTo(inst.map);
		if(item.popup) {
			epic.map.instances[id].items[itemId].popup = new mapboxgl.Popup(epic.map.options.popup)
				.setDOMContent(item.popup);
			/*epic.map.instances[id].items[itemId].popup = new mapboxgl.Popup(item.pdata.options)
				.setDOMContent(item.popup);*/
			epic.map.instances[id].items[itemId].marker.setPopup(epic.map.instances[id].items[itemId].popup);
		}
		epic.map.instances[id].bounds.extend([item.lng, item.lat]);
		inst.map.fitBounds(epic.map.instances[id].bounds, {padding: 64});
	},
	initMarkers: (id) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		for(itemId in inst.items) {epic.map.initMarker(id, itemId)}
	},
	initItem: (id, el) => {
		let inst = epic.map.getInst(id);
		if(!inst || el === undefined || typeof el !== "object") {return}
		let item = {
			el: el,
			data: el.querySelector(epic.map.x.dta),
			marker: false,
			popup: false,
			mdata: {
				options: {},
				type: false,
				hover: false,
			}
		}
		if(item.data === null) {
			item.data = false;
			epic.map.instances[id].items.push(item);
			return
		}
		/* id */
		let itemId = $(item.data).attr(epic.map.x.x + "id");
		if(itemId === undefined || itemId === "") {itemId = "" + j + ""}
		$(el).attr(epic.map.x.x + "id", itemId);
		/* lng, lat & address */
		item.lng = $(item.data).attr(epic.map.x.x + "lng");
		if(item.lng === undefined || isNaN(item.lng) || item.lng === "") {item.lng = false}
		else {item.lng = Number(item.lng)}
		item.lat = $(item.data).attr(epic.map.x.x + "lat");
		if(item.lat === undefined || isNaN(item.lat) || item.lat === "") {item.lat = false}
		else {item.lat = Number(item.lat)}
		item.address = $(item.data).attr(epic.map.x.x + "address");
		if(item.address === undefined || item.address === "") {item.address = false}
		/* marker */
		item.mdata.type = $(el).attr(epic.map.x.x + "marker");
		if(item.mdata.type === undefined || item.mdata.type === "") {item.mdata.type = false}
		item.mdata.hover = $(el).attr(epic.map.x.x + "hovermarker");
		if(item.mdata.hover === undefined || item.mdata.hover === "") {item.mdata.hover = false}
		/* options */
		if(typeof epicMapOptions !== "undefined" && epicMapOptions.hasOwnProperty("marker")) {
			for(key in epicMapOptions.marker) {
				item.mdata.options[key] = epicMapOptions.marker[key];
			}
		}
		else {
			for(key in epic.map.options.marker) {
				item.mdata.options[key] = epic.map.options.marker[key];
			}
		}
		if(el.hasAttribute(epic.map.x.x + "marker") && $(el).attr(epic.map.x.x + "marker") !== "") {
			item.mdata.type = $(el).attr(epic.map.x.x + "marker");
		}
		if(el.querySelector("[" + epic.map.x.x + "marker]") !== null && $(el.querySelector("[" + epic.map.x.x + "marker]")).attr(epic.map.x.x + "marker") !== "") {
			item.mdata.type = $(el.querySelector("[" + epic.map.x.x + "marker]")).attr(epic.map.x.x + "marker");
		}
		if(el.querySelector(epic.map.x.mrk) !== null) {
			item.mdata.type = el.querySelector(epic.map.x.mrk);
		}
		if(typeof item.mdata.type === "string") {
			if(item.mdata.type.charAt(0) === "#") {
				item.mdata.options.color = item.mdata.type;
			}
			else {
				item.mdata.options.element = document.createElement("div");
				item.mdata.options.element.className = item.mdata.type;
			}
		}
		else if(typeof item.mdata.type === "object" && item.mdata.type !== undefined) {
			item.mdata.options.element = item.mdata.type;
		}
		/* popup */
		item.popup = el.querySelector(epic.map.x.pop);
		if(item.popup === null) {item.popup = false}
		/* store */
		epic.map.instances[id].items[itemId] = item;
		/* hover */
		$(el).hover(
			() => {epic.map.onHover(id, itemId, "marker", true)},
			() => {epic.map.onHover(id, itemId, "marker", false)}
		);
		/*  */
		if(item.lng !== false && item.lat !== false) {epic.map.initMarker(id, itemId)}
		else if(item.address !== false) {
			let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + item.address + ".json?limit=1&access_token=" + mapboxgl.accessToken;
			let xhr = new XMLHttpRequest();
			xhr.addEventListener("load", () => {
				let data = JSON.parse(xhr.response);
				if(data.hasOwnProperty("features") 
					&& data.features[0].hasOwnProperty("geometry") 
					&& data.features[0].geometry.hasOwnProperty("coordinates")) {
					let lnglat = data.features[0].geometry.coordinates;
					epic.map.instances[id].items[itemId].lng = lnglat[0];
					epic.map.instances[id].items[itemId].lat = lnglat[1];
					epic.map.initMarker(id, itemId);
				}
			});
			xhr.open("GET", url, true);
			xhr.send();
		}
	},
	initItems: (id) => {
		let inst = epic.map.getInst(id);
		if(!inst) {return}
		$(inst.container).find(epic.map.x.lst).each(function() {
			/* id */
			$(this).attr(epic.map.x.x + "id", id);
			/* data */
			let ldata = {
				marker: $(this).attr(epic.map.x.x + "marker"),
				hovermarker: $(this).attr(epic.map.x.x + "hovermarker"),
				markeroptions: $(this).attr(epic.map.x.x + "markeroptions"),
				popupoptions: $(this).attr(epic.map.x.x + "popupoptions"),
			}
			for(key in ldata) {
				if(ldata[key] === undefined || ldata[key] === "") {ldata[key] = false}
			}
			/* items */
			$(this).children().each(function() {
				let idata = {
					marker: $(this).attr(epic.map.x.x + "marker"),
					hovermarker: $(this).attr(epic.map.x.x + "hovermarker"),
					markeroptions: $(this).attr(epic.map.x.x + "markeroptions"),
					popupoptions: $(this).attr(epic.map.x.x + "popupoptions"),
				}
				for(key in idata) {
					if(idata[key] === undefined || idata[key] === "") {
						if(ldata[key] !== false) {
							$(this).attr(epic.map.x.x + key, ldata[key])
						}
					}
				}
				epic.map.initItem(id, this);
			});
		});
	},
	initMap: (id) => {
		let inst = epic.map.getInst(id);
		if(!inst || !inst.map) {return}
		inst.options.container = inst.map;
		inst.map = new mapboxgl.Map(inst.options);
		inst.bounds = new mapboxgl.LngLatBounds();
		if(inst.nav !== false) {
			inst.map.addControl(new mapboxgl.NavigationControl());
		}
		epic.map.instances[id] = inst;
	},
	init: () => {
		epic.map.initAttrs();
		$(epic.map.x.con).each(function(i) {
			let inst = {
				container: this,
				map: this.querySelector(epic.map.x.map),
				options: {},
				nav: true,
				items: {},
				activeItems: [],
			}
			if(inst.map === null) {inst.map = false}
			/* id */
			let id = $(this).attr(epic.map.x.x + "id");
			if(id === undefined || id === "") {
				id = "" + i + "";
				$(this).attr(epic.map.x.x + "id", id);
			}
			/* options */
			inst.options = $(this).attr(epic.map.x.ops);
			if(inst.options === undefined) {inst.options = "map"}
			if(typeof epicMapOptions !== "undefined" && epicMapOptions.hasOwnProperty(inst.options)) {
				inst.options = epicMapOptions[inst.options];
			}
			else if(epic.map.options.hasOwnProperty(inst.options)) {
				inst.options = epic.map.options[inst.options];
			}
			else {inst.options = epic.map.options.map}
			/* nav */
			let nav = $(this).attr(epic.map.x.x + "nav");
			if(typeof nav === "string" && nav !== "") {
				if(nav === "false") {nav = false}
				else if(nav === "true") {nav = true}
				inst.nav = nav;
			}
			/* store */
			epic.map.instances[id] = inst;
			/* map */
			epic.map.initMap(id);
			epic.map.initItems(id);
			//epic.map.initMarkers(id);
			setTimeout(() => {epic.map.initFilters(id)}, 100);
		});
	}
}
epic.map.init();
