//This handles all the sockets between client and server

// var socket = io.connect('http://localhost'); /** USE ON LOCALHOST **/
var socket = io.connect('http://209.129.244.25'); /** USE THIS CMU SERVER IP WHEN HOSTING PUBLIC **/

//Listen and retrieve all data from server. Set markers on map
socket.on('setMarkers', function(items) {
	console.log('+getAllData+');
	clearOverlays();
	for (var i = 0; i < items.length; i++) {
		createMarker(items[i].LATITUDE, items[i].LONGITUDE, items[i]);
	}
	for (var i = 0; i < markersArray.length; i++) {
		createInfoWindow(markersArray[i], markersInfo[i]);
	}
	setInfo(items);
	socket.emit('getUserList');

});

//Listen and retrieve audio from server
socket.on('setAudios', function(audio, loop) {
	setAudio(audio, loop);
});

//Listen and retrieve dialogs from server
socket.on('setDialogList', function(items) {
	setDialogList(items);
});

//Listen and retrieve users from server
socket.on('setUserList', function(items) {
	setUserList(items);
});

//Listen and retrieve data from server
socket.on('setData', function(items){
	clearOverlays();
	$('.dialog-info').html('');
	stopAudio();
	$('.dialog-info').scrollTop(0);

	showDialogOnMap(items);
	setInfo(items);
});