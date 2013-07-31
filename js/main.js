function setInfoWindow() {
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
}


function setAudio(audio, loop) {
	console.log('loop', loop);
	var src = "data:audio/wav;base64," + audio;
	$('.audio').attr('src', src);

	setActiveMarker();
	$('.message').removeClass('audio-active');
	$(currLoad).addClass('audio-active');
	$('.audio').unbind('ended');

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
	if (items.length) {
		var date = new Date(items[0].TIME);
		$('.dialog-time').text(date.toString());
	}
	$('.dialog-info').append(content);
}

function autoScoll() {
	scrollHeight = $('.audio-active').position().top - $('.dialog-info').position().top + $('.dialog-info').scrollTop();
	console.log('hieght', scrollHeight);
	$('.dialog-info').scrollTop(scrollHeight);
}

function getData() {
	var id = filterUserID
	var interaction = filterDialogID;
	var status;

	if (!statusArray.length) {
		status = {
			$exists: true
		}
	} else {
		status = {
			$in: statusArray
		}
	}

	console.log('id', id);
	console.log('interaction', interaction);
	console.log('status', status);

	var conditions = {
		STATUS: status,
		USERID: id,
		INTERACTION: interaction
	}
	var order = reverse;
	socket.emit('getData', conditions, order);
}