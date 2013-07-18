var socket = io.connect('http://localhost');
var currentItem;
context = new webkitAudioContext();
// on connection to server, ask for user's name with an anonymous callback
socket.on('getWord', function(item) {

	console.log("length", item.length);
	if (item.length) {
		$(".item_name").val(item[0].name);
		$(".item_type").val(item[0].type);
		setMapPosition(item[0].lat, item[0].lng);
		currentItem = item[0];
	} else {
		$(".item_name").val("no item found");
		$(".item_type").val("no item found");
	}
});

socket.on('setMarkers', function(items) {
	for (var i = 0; i < items.length; i++) {
	createMarker(items[i].LATITUDE, items[i].LONGITUDE, items[i]);
	};
	for (var i = 0; i < markersArray.length; i++) {
		createInfoWindow(markersArray[i], markersInfo[i]);
	};
	
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function(username, data) {

});

// listener, whenever the server emits 'updateusers', this updates the username list
socket.on('updateusers', function(data) {

});

socket.on('setAudio', function(buffer){
	console.log(buffer[0].AUDIO);
	var src = "data:audio/wav;base64,"+ buffer[0].AUDIO;
	$('.text').html('<audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"> <source class="source" src="'+src+'"/> </audio>');
});

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}