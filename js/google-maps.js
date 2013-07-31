var infowindow;
var map;
var geocoder;
var markersArray = [];
var markersInfo = [];
var dialogArray = [];

function load() {
	navigator.geolocation.getCurrentPosition(userLocation, error);
}

function setMapPosition(lat, lng) {
	map.setCenter(new google.maps.LatLng(lat, lng));
}

function createMarker(lat, lng, info) {
	// console.log("+createPath");
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
	};

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
		info.index = n
		markersInfo[n].push(info); //For InfoWindow
	}
	dialogArray.push(info)
	return marker;
	// console.log("-createPath");
}

function createInfoWindow(marker, info) {
	google.maps.event.addListener(marker, 'click', function() {
		displayInfoWindow(marker, info);
	});
}

function displayInfoWindow(marker, info) {
	if (infowindow) infowindow.close();
	infowindow = new google.maps.InfoWindow({
		content: generateMapInfo(info, 'map'),
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

function generateInfo(info, header) {
	console.log("+generateInfo");
	var text = "";
	var message = "";
	var transcriptArray;

	for (var i = 0; i < info.length; i++) {
		message += generateMessage(info[i], header);
	}
	text = '<div class="' + header + '-marker marker">';
	text += message;
	text += '</div>';
	return text;
}

function generateMapInfo(info, header) {
	console.log("+generateInfo");
	var text = "";
	var message = "";
	var transcriptArray;

	for (var i = 0; i < info.length; i++) {
		message += generateMapMessage(info[i], header);
	}
	text = '<div class="' + header + '-marker marker">';
	text += message;
	text += '</div>';
	return text;
}

function generateMessage(info, header) {

	var message = "";
	var transcriptSpan = "";
	var words = [];

	if (info.TRANSCRIPT) {
		words = info.TRANSCRIPT.split(' ');
		words = addType(info, words, header)
	}

	// console.log("+words array", words);

	for (var j = 0; j < words.length; j++) {
		if (words[j].indexOf("</span>") == -1) {
			transcriptSpan += "<span val='" + j + "'>" + words[j] + "</span> "
		} else {
			transcriptSpan += words[j]
		}
	};
	// console.log("+words to string: ", transcriptSpan);

	message += "<div class='" + header + "-message message' val='" + info._id + "'>";

	message += "<div class='loading' val='" + info.index + "'>"
	message += "<img class='" + header + "-loading' src='img/playlist.svg' style='width: 25px' />";
	message += "<img class='" + header + "-play' src='img/play.svg' style='width: 28px' />";
	message += '</div>'

	message += "<div contenteditable='true' class='" + header + "-transcript transcript'>" + transcriptSpan;
	message += '</div>'


	var pending = '<input name="' + info._id + '" value="pending" type="radio">'
	var processing = '<input name="' + info._id + '" value="processing" type="radio">'
	var verified = '<input name="' + info._id + '" value="verified" type="radio">'

	if (info.STATUS == 'pending') {
		pending = '<input name="' + info._id + '" value="pending" type="radio" checked>'
	} else if (info.STATUS == 'processing') {
		processing = '<input name="' + info._id + '" value="processing" type="radio" checked>'
	} else if (info.STATUS == 'verified') {
		verified = '<input name="' + info._id + '" value="verified" type="radio" checked>'
	} else {
		pending = '<input name="' + info._id + '" value="pending" type="radio" checked>'
	}

	message += "<div class='checkbox'>"
	message += pending
	message += '<label for="check">Pending</label><br>'
	message += processing
	message += '<label for="check">Processing</label><br>'
	message += verified
	message += '<label for="check">Verified</label>'
	message += '</div>'

	message += '</div>'
	return message;
}

function generateMapMessage(info, header) {
	var message = "";
	var transcriptSpan = "";
	var words = [];

	if (info.TRANSCRIPT) {
		words = info.TRANSCRIPT.split(' ');
		words = addType(info, words, header)
	}

	// console.log("+words array", words);

	for (var j = 0; j < words.length; j++) {
		if (words[j].indexOf("</span>") == -1) {
			transcriptSpan += "<span val='" + j + "'>" + words[j] + "</span> "
		} else {
			transcriptSpan += words[j]
		}
	};
	// console.log("+words to string: ", transcriptSpan);

	message += "<div class='" + header + "-message message' val='" + info._id + "'>";

	message += "<div class='loading' val='" + info.index + "' style='width: 20%'>"
	message += "<img class='" + header + "-loading' src='img/play.svg' style='width: 25px' />";
	// message += "<img class='" + header + "-play' src='img/play.svg' style='width: 28px' />";
	message += '</div>'

	message += "<div contenteditable='true' class='" + header + "-transcript transcript' style='width: 80%'>" + transcriptSpan;
	message += '</div>'

	message += '</div>'
	return message;
}

//Add annotations

function addType(info, words, header) {
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


function rad(x) {
	return x * Math.PI / 180;
}

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

google.maps.event.addDomListener(window, 'load', load)

var userLocation = function(pos) {
	var lat = pos.coords.latitude;
	var lng = pos.coords.longitude;
	initialize(lat, lng);
}

var error = function(error) {
	if (error.code === 1) {
		alert('Unable to get location');
	}
}