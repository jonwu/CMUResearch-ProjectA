var infowindow;
var map;
var geocoder;
var markersArray = [];
var markersInfo = [];

function load() {
	navigator.geolocation.getCurrentPosition(userLocation, error);
}

function setMapPosition(lat, lng) {
	map.setCenter(new google.maps.LatLng(lat, lng));
}

function createMarker(lat, lng, info) {
	// console.log("+createPath");
	var radius = 0.05;
	var pos = new google.maps.LatLng(lat, lng);
	var exist = false;
	var n = null;
	for (var i = 0; i < markersArray.length; i++) {
		var mlat = markersArray[i].getPosition().lat();
		var mlng = markersArray[i].getPosition().lng();
		// console.log("haversine+", mlat);
		// console.log("haversine+", mlng);
		// console.log("haversine+", lat);
		// console.log("haversine+", lng);
		if (haversine(mlat, mlng, lat, lng, radius)) {
			// if (pos.equals(markersArray[i].getPosition())) {
			exist = true;
			n = i;
			break;
		}
	};

	if (!exist) {
		var infoArray = []
		var marker = new google.maps.Marker({
			map: map,
			position: pos,
		});
		markersArray.push(marker);
		infoArray.push(info);
		markersInfo.push(infoArray);
	} else if (exist) {
		markersInfo[n].push(info);
	}

	return marker;
	// console.log("-createPath");
}

function createInfoWindow(marker, info) {
	// console.log("info", info);
	google.maps.event.addListener(marker, 'click', function() {
		displayInfoWindow(marker, info);
	});
}

function displayInfoWindow(marker, info) {
	if (infowindow) infowindow.close();
	infowindow = new google.maps.InfoWindow({
		content: generateInfo(info),
		maxWidth: 700
	});
	google.maps.event.addListener(infowindow, 'domready', function() {
		// $(".transcript").lettering('words');
		$('.transcript span').hover(function() {
			var currWord = $(this).text();
			console.log("word", currWord);
		}, function() {});
		$('.transcript span').on('click', function() {
			if (phraseCtrl) {
				if ($(this).hasClass('phrase_selected')) {
					$(this).removeClass('phrase_selected');
					$(this).removeClass('selected');
				} else {
					$(this).addClass('phrase_selected');
				}
			} else {
				if ($(this).hasClass('selected') || $(this).hasClass('phrase_selected')) {
					$(this).removeClass('selected');
					$(this).removeClass('phrase_selected');
				} else {
					$(this).addClass('selected');
				}
			}
		});
		$('.loading').on('click', function() {
			currLoad = this;
			var _id = $(this).attr('val');
			socket.emit('getAudio', _id);

		});
	});
	// startLettering();
	console.log(markersInfo);
	infowindow.open(map, marker);
}

function generateInfo(info) {
	console.log("+generateInfo");
	var text;
	var message = "";
	var transcriptArray;


	for (var i = 0; i < info.length; i++) {

		var transcriptSpan = "";
		var words = [];

		if (info[i].TRANSCRIPT) {
			words = info[i].TRANSCRIPT.split(' ');
			words = addType(info[i], words)
		}

		console.log("+words array", words);

		for (var j = 0; j < words.length; j++) {
			if (words[j].indexOf("</span>") == -1) {
				transcriptSpan += "<span val='" + j + "'>" + words[j] + "</span> "
			} else {
				transcriptSpan += words[j]
			}
		};
		console.log("+words to string: ", transcriptSpan);
		message += "<div class='message'><div class='time'>" + info[i].TIME + "<br>" + info[i].DATE
		message += "<br><img class='loading' val='" + info[i]._id + "'src='img/load.svg' style='width: 50px' />";
		message += "</div>";
		message += "<div class='transcript'>" + transcriptSpan;
		// message += '<audio autobuffer="autobuffer" autoplay="autoplay"> <source class="source" src=""/> </audio>';
		message += '</div></div>'

	};

	text = '<div class="marker">';
	text += message;
	text += '</div>';
	return text;
}

//Add annotations
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

		words[position] = "<span class='" + type + " type' val='" + position + "'>" + words[position] + "</span>"+ " "+ "<sub contenteditable='true' class='subtype'>"+ type +" </sub>"
	};
	for (var n = 0; n < wordsToSplice.length; n++) {
		words.splice(wordsToSplice[n] - n, 1);
	};
	return words;
}



function initialize(lat, lng) {
	// socket.emit("setLatLng", lat, lng);
	console.log(lat);
	console.log(lng);
	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	socket.emit("getAllData");

}

function codeAddress(place) {

	var address = place;

	geocoder.geocode({
		'address': address
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
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