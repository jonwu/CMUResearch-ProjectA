//Calls load function and initializes map
google.maps.event.addDomListener(window, 'load', load);

//Load your current location and initialize maps 
function load() {
	navigator.geolocation.getCurrentPosition(userLocation, error); //userlocation is in global.js
}

//Set current position

function setMapPosition(lat, lng) {
	map.setCenter(new google.maps.LatLng(lat, lng));
}


/**
 * Initialize Map
 * @param  {float} lat start latitude
 * @param  {float} lng start longitude
 * @return {none}     none
 */

function initialize(lat, lng) {
	console.log(lat);
	console.log(lng);
	var mapOptions = {
		zoom: 12,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	socket.emit("getAllData");
}

/**
 * Create marker at a given location. If a new marker location is near an exisitng marker, they merge as one marker
 * @param  {flaot} lat  latitude of marker
 * @param  {float} lng  longitude of marker
 * @param  {object} info data retrieve from mongodb
 */

function createMarker(lat, lng, info) {
	var radius = 0.03;
	var pos = new google.maps.LatLng(lat, lng);
	var exist = false;
	var n = null;
	for (var i = 0; i < markersArray.length; i++) {
		var mlat = markersArray[i].getPosition().lat();
		var mlng = markersArray[i].getPosition().lng();
		if (haversine(mlat, mlng, lat, lng, radius)) {
			exist = true;
			n = i;
			break;
		}
	}

	//Check if there's an existing marker at given location
	if (!exist) {
		var infoArray = [];
		var marker = new google.maps.Marker({
			map: map,
			position: pos,
		});
		marker.setIcon('../img/non-active.png');
		markersArray.push(marker); //All Markers
		n = markersArray.length - 1;
		info.index = n;
		infoArray.push(info);
		markersInfo.push(infoArray);
	} else if (exist) {
		info.index = n;
		markersInfo[n].push(info); //For InfoWindow
	}
	dialogArray.push(info);
	return;
}

/**
 * Create info window
 * @param  {Google Marker} marker marker to add infowindow
 * @param  {Object} info   data to insert into infowindow
 * @return {none}        none
 */

function createInfoWindow(marker, info) {
	google.maps.event.addListener(marker, 'click', function() {
		displayInfoWindow(marker, info);
	});
}


/**
 * Display content onto infowindow
 * @param  {Google Marker} marker marker to display on infowindow
 * @param  {object} info   data to insert on infowindow
 * @return {none}        none
 */

function displayInfoWindow(marker, info) {
	if (infowindow) infowindow.close();
	infowindow = new google.maps.InfoWindow({
		content: generateMapInfo(info),
		maxWidth: 700
	});
	google.maps.event.addListener(infowindow, 'domready', function() {
		$('.map-loading').on('click', function() {
			$('.audio-active').removeClass('audio-active');
			currLoad = $(this).parents('.map-message');
			currLoad.addClass('audio-active');
			var _id = $(currLoad).attr('val');
			socket.emit('getAudio', _id, false);
		});
	});
	infowindow.open(map, marker);
}

/**
 * Generate wrapper to put on filter window
 * @param  {object} info   data to insert on filter window
 * @return {none}        none
 */

function generateInfo(info) {
	console.log("+generateInfo");
	var text = "";
	var message = "";
	var transcriptArray;

	for (var i = 0; i < info.length; i++) {
		message += generateMessage(info[i]);
	}
	text = '<div class="main-marker marker">';
	text += message;
	text += '</div>';
	return text;
}


/**
 * Generate content to insert into wrapper on filter window
 * @param  {object} info data retrieved from mongodb
 * @return {String}      html content
 */

function generateMessage(info) {

	var message = "";
	var transcriptSpan = "";
	var words = [];

	if (info.TRANSCRIPT) {
		words = info.TRANSCRIPT.split(' ');
		words = addType(info, words);
	}

	//Build transcript
	for (var j = 0; j < words.length; j++) {
		if (words[j].indexOf("</span>") == -1) {
			transcriptSpan += "<span val='" + j + "'>" + words[j] + "</span> ";
		} else {
			transcriptSpan += words[j];
		}
	}

	//Transcript
	message += "<div class='main-message message' val='" + info._id + "'>";
	message += "<div class='loading' val='" + info.index + "'>";
	message += "<img class='main-loading' src='img/playlist.svg' style='width: 25px' />";
	message += "<img class='main-play' src='img/play.svg' style='width: 28px' />";
	message += '</div>';
	message += "<div contenteditable='true' class='main-transcript transcript'>" + transcriptSpan;
	message += '</div>';

	//Status checkboxes
	var pending = '<input name="' + info._id + '" value="pending" type="radio">';
	var processing = '<input name="' + info._id + '" value="processing" type="radio">';
	var verified = '<input name="' + info._id + '" value="verified" type="radio">';

	if (info.STATUS == 'pending') {
		pending = '<input name="' + info._id + '" value="pending" type="radio" checked>';
	} else if (info.STATUS == 'processing') {
		processing = '<input name="' + info._id + '" value="processing" type="radio" checked>';
	} else if (info.STATUS == 'verified') {
		verified = '<input name="' + info._id + '" value="verified" type="radio" checked>';
	} else {
		pending = '<input name="' + info._id + '" value="pending" type="radio" checked>';
	}
	message += "<div class='checkbox'>";
	message += pending;
	message += '<label for="check">Pending</label><br>';
	message += processing;
	message += '<label for="check">Processing</label><br>';
	message += verified;
	message += '<label for="check">Verified</label>';
	message += '</div>';
	message += '</div>';


	return message;
}

/**
 * Generate wrapper to insert into Marker's InfoWindow
 * @param  {object} info data retrieved from mongodb
 * @return {string}      return wrapper html
 */

function generateMapInfo(info) {
	console.log("+generateInfo");
	var text = "";
	var message = "";
	var transcriptArray;

	for (var i = 0; i < info.length; i++) {
		message += generateMapMessage(info[i]);
	}
	text = '<div class="map-marker marker">';
	text += message;
	text += '</div>';
	return text;
}

/**
 * Generate content inside wrapper on marker's infowindow
 * @param  {Object} info data retrieved from mongodb
 * @return {string}      return content html
 */

function generateMapMessage(info) {
	var message = "";
	var transcriptSpan = "";
	var words = [];

	if (info.TRANSCRIPT) {
		words = info.TRANSCRIPT.split(' ');
		words = addType(info, words);
	}


	for (var j = 0; j < words.length; j++) {
		if (words[j].indexOf("</span>") == -1) {
			transcriptSpan += "<span val='" + j + "'>" + words[j] + "</span>";
		} else {
			transcriptSpan += words[j];
		}
	}
	

	message += "<div class='map-message message' val='" + info._id + "'>";
	message += "<div class='loading' val='" + info.index + "' style='width: 20%'>";
	message += "<img class='map-loading' src='img/play.svg' style='width: 25px' />";
	message += '</div>';
	message += "<div contenteditable='true' class='map-transcript transcript' style='width: 80%'>" + transcriptSpan;
	message += '</div>';
	message += '</div>';
	return message;
}


/**
 * Display annotations in windows
 * @param {object} info  data retrieved from mongodb
 * @param {String} words words selected
 */

function addType(info, words) {
	var wordsToSplice = [];
	for (var k = 0; k < info.ANNOTATION.length; k++) {
		var position = info.ANNOTATION[k].position;
		var type = info.ANNOTATION[k].type;
		var phrase = info.ANNOTATION[k].name.split(' ')

		console.log("+phrase", phrase);
		//More than one word (phrase)
		for (var i = 1; i < phrase.length; i++) {
			var end = position + 1;
			words[position] += " " + words[end];
			console.log("index", end);
			wordsToSplice.push(end);
		};

		words[position] = "<span class='" + type + " type' val='" + position + "'>" + words[position] + "</span>"
		words[position] += " " + "<sub contenteditable='false' val='" + info._id + "' class='subtype'>" + type + " </sub>"
	};
	for (var n = 0; n < wordsToSplice.length; n++) {
		words.splice(wordsToSplice[n] - n, 1);

	};
	return words;
}

/**
 * Haversince algorithm to find markers within a certain radius
 * @param  {float} nlat     orign lat
 * @param  {float} nlong    origin lng
 * @param  {float} mlat     target lat
 * @param  {float} mlong    target lng
 * @param  {float} distance radius of boundary in KM
 * @return {integer}          if inside bounds return 1, if not return 0
 */
function haversine(nlat, nlong, mlat, mlong, distance) {

	var R = 6371; // radius of earth in km
	var distances = [];
	var closest = -1;
	var dLat = rad(mlat - nlat);
	var dLong = rad(mlong - nlong);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(nlat)) * Math.cos(rad(nlat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	if (d < distance) {
		return 1;
	} else {
		return 0;
	}
}

/**
 * Radius conversion
 */
function rad(x) {
	return x * Math.PI / 180;
}

/**
 * Clear all markers, descriptions, and audios
 * @return {none} none
 */
function clearOverlays() {
	$('.audio').unbind('ended');
	dialogArray = [];
	markersInfo = [];
	var size = markersArray.length;
	for (var i = 0; i < size; i++) {
		var marker = markersArray.pop();
		marker.setMap(null);
	}

}



