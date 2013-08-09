// var socket = io.connect('http://localhost');
var socket = io.connect('http://209.129.244.25');
var currentItem;
// on connection to server, ask for user's name with an anonymous callback


socket.on('setMarkers', function(items) {
	console.log('+getAllData+');
	clearOverlays();
	for (var i = 0; i < items.length; i++) {
		createMarker(items[i].LATITUDE, items[i].LONGITUDE, items[i]);
	};
	for (var i = 0; i < markersArray.length; i++) {
		createInfoWindow(markersArray[i], markersInfo[i]);
	};
	setInfo(items);
	socket.emit('getUserList');

});

socket.on('setAudios', function(audio, loop) {
	setAudio(audio, loop);
});

socket.on('setDialogList', function(items) {
	setDialogList(items);
});

socket.on('setUserList', function(items) {
	setUserList(items);
});
socket.on('setData', function(items){
	clearOverlays();
	$('.dialog-info').html('');
	stopAudio();
	$('.dialog-info').scrollTop(0);

	showDialogOnMap(items);
	setInfo(items);
})