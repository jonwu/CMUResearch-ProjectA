// var socket = io.connect('http://localhost');
var socket = io.connect('http://209.129.244.25');
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
		setList(items[i].USERID,items[i].INTERACTION, items[i]);
	};
	setDialogList();
	for (var i = 0; i < markersArray.length; i++) {
		console.log(markersInfo[i]);
		createInfoWindow(markersArray[i], markersInfo[i]);
	};

});

socket.on('setAudios', function(audio) {
	var src = "data:audio/wav;base64," + audio;
	$('.audio').attr('src',src);
	// $(currLoad).parent().next().children('audio').attr('src', src);
});

function b64_to_utf8(str) {
	return decodeURIComponent(escape(window.atob(str)));
}
