function setInfoWindow() {
	console.log('array length', markersArray.length);
	for (var i = 0; i < markersArray.length; i++) {
		createInfoWindow(markersArray[i], markersInfo[i]);
	}
}

function showDialogOnMap(dialogItems) {

	for (var i = 0; i < dialogItems.length; i++) {
		var lat = dialogItems[i].LATITUDE;
		var lng = dialogItems[i].LONGITUDE;
		var item = dialogItems[i];
		createMarker(lat, lng, item);
	};
	setInfoWindow();
}

function showAllDialogs(userID) {
	socket.emit('getUserInfo', userID);
}

function setUserList(items) {
	$('.user-option').remove();
	for (var i = 0; i < items.length; i++) {
		var userID = items[i];
		var content = "<option class='user-option' value='" + userID + "'>User" + (i + 1) + "</option>";
		$('.user-list').append(content);
	};
}

function setDialogList(items) {
	$('.dialog-option').remove();
	for (var i = 0; i < items.length; i++) {
		var dialogID = items[i];
		var content = "<option class='dialog-option' value='" + dialogID + "'> Dialog " + (i + 1) + "</option>";
		$('.dialog-list').append(content);
	};
	setDialogInfo();
}

function setDialogInfo() {

	var userID = $('.user-list').val();
	var dialogID = $('.dialog-list option:selected').val();
	$('.dialog-info').html('');
	if (dialogID != 'dialog-all') {
		console.log("d-log", dialogID);
		socket.emit('getDialogInfo', userID, dialogID)
	}
}

function setAudio(audio, loop) {
	console.log('loop', loop);
	var src = "data:audio/wav;base64," + audio;
	$('.audio').attr('src', src);

	setActiveMarker();
	console.log($(currLoad).children());
	$('.message').removeClass('audio-active');
	$(currLoad).addClass('audio-active');
	stopAudio();

	if (loop) {
		autoScoll();
		currLoad = $(currLoad).next();

		if (currLoad.length) {
			$('.audio').bind('ended', function() {
				var _id = $(currLoad).attr('val');
				socket.emit('getAudio', _id, true);
				$('.audio').unbind('ended');
			});
		} else { //Last Audio played
			$('.audio').bind('ended', function() {
				markersArray[prevIndex].setIcon('../img/non-active.png');
			});
		}
	}
}

function stopAudio() {
	$('.audio').bind('ended', function() {
		markersArray[prevIndex].setIcon('../img/non-active.png');
		$('.audio').unbind('ended');
	});
	
}

var prevIndex = 0;

function setActiveMarker() {
	markersArray[prevIndex].setIcon('../img/non-active.png');
	var index = $(currLoad).children('.loading').attr('val');
	markersArray[index].setIcon('../img/active.png');
	prevIndex = index;
	var lat = markersArray[index].getPosition().lat()
	var lng = markersArray[index].getPosition().lng()
	var pos = new google.maps.LatLng(lat, lng);
	// var bounds = new google.maps.LatLngBounds(pos,pos)
	map.panTo(pos);

	var currZoom = map.getZoom();
	// alert(currZoom)
	if (currZoom < 13) {
		map.setZoom(13);
	}
}

function setInfo(items) {
	content = generateInfo(items, 'main');
	var date = new Date(items[0].TIME);
	$('.dialog-time').text(date.toString());
	$('.dialog-info').append(content);
}

function setReverseInfo(items) {
	content = generateReverseInfo(items, 'main');
	var date = new Date(items[items.length - 1].TIME);
	$('.dialog-time').text(date.toString());
	$('.dialog-info').append(content);
}

function autoScoll() {
	scrollHeight = $('.audio-active').position().top - $('.dialog-info').position().top + $('.dialog-info').scrollTop();
	console.log('hieght', scrollHeight);
	$('.dialog-info').scrollTop(scrollHeight);
}