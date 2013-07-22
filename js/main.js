var phraseCtrl = false;
$(document).ready(function() {

	console.log("start lettering press --");
	$(".word_split").lettering('words');
	console.log("stop lettering press --");

	$('.word_split span').hover(function() {
		var currWord = $(this).text();
		console.log("word", currWord);
		socket.emit('setWord', currWord);
	}, function() {});

	$('.update').on("click", function() {
		var name = $(".item_name").val();
		var type = $(".item_type").val();
		socket.emit('updateItem', name, type);
	});
});

$(function() {
	$(window).keydown(function(e) {
		if (e.keyCode == 81 && e.shiftKey) {
			$('.selected').each(function(index) {
				console.log("selected", $(this).text());
			});
		} else if (e.keyCode == 87 && e.shiftKey) {

		}
		if (e.ctrlKey) {
			phraseCtrl = true;
		}
	});
	$(window).keyup(function(e) {

		phraseCtrl = false;

	});

});

$(document).ready(function() {
	$(".user-list").change(function() {
		setDialogList();
		clearOverlays();

		if ($(this).val() == 'user-all') {
			showAllMarkers();
		} else {
			var userID = $('.user-list').val();
			showAllDialogs(userID);
		}
		setInfoWindow();
	});
	$(".dialog-list").change(function() {
		setDialogInfo();
		clearOverlays();

		if ($(this).val() == 'dialog-all') {
			var userID = $('.user-list').val();
			showAllDialogs(userID);
		} else {
			showDialog();
		}
		setInfoWindow();
	});
});

function setInfoWindow() {
	for (var i = 0; i < markersArray.length; i++) {
		createInfoWindow(markersArray[i], markersInfo[i]);
	}
}

function showDialog() {
	// clearOverlays();
	var userID = $('.user-list').val();
	var dialogID = $('.dialog-list option:selected').val();

	var dialogItems = userList[userID][dialogID];
	for (var i = 0; i < dialogItems.length; i++) {
		var lat = dialogItems[i].LATITUDE;
		var lng = dialogItems[i].LONGITUDE;
		var item = dialogItems[i];
		createMarker(lat, lng, item);
	};
}

function showAllMarkers() {
	// clearOverlays();
	for (var i = 0; i < userList.allUsers.length; i++) {
		var userID = userList.allUsers[i];
		console.log('all users', userID);
		showAllDialogs(userID);
	};
}

function showAllDialogs(userID) {

	if (userList[userID]) {
		for (var j = 0; j < userList[userID].dialogList.length; j++) {
			var dialogID = userList[userID].dialogList[j];
			var items = userList[userID][dialogID];
			for (var k = 0; k < items.length; k++) {
				createMarker(items[k].LATITUDE, items[k].LONGITUDE, items[k]);
			};
		};
	}
}

function setList(userID, dialogID, items) {

	var dialogID = dialogID.replace(/[^a-zA-Z 0-9]+/g, '');
	// console.log('id----', dialogID);
	if (userList[userID]) {
		//UserID exists
		if (!userList[userID][dialogID]) {
			userList[userID][dialogID] = [];
			userList[userID].dialogList.push(dialogID);
		}
		userList[userID][dialogID].push(items);

	} else {
		//New userID
		userList.allUsers.push(userID);
		userList[userID] = {};
		userList[userID].dialogList = []
		userList[userID].dialogList.push(dialogID);
		userList[userID][dialogID] = [];
		userList[userID][dialogID].push(items);

		var content = "<option value='" + userID + "'>" + userID + "</option>";
		$('.user-list').append(content);

		console.log('user-list values', $('.user-list').val());
	}
}

function setDialogList() {

	var userID = $('.user-list').val();
	$('.dialog-option').remove();
	if (userList[userID]) {
		for (var i = 0; i < userList[userID].dialogList.length; i++) {
			// var dialogID = "";
			var dialogID = userList[userID].dialogList[i];

			var content = "<option class='dialog-option' value='" + dialogID + "'>" + dialogID + "</option>";
			$('.dialog-list').append(content);
		};
	}
	setDialogInfo();
}

function setDialogInfo() {
	var userID = $('.user-list').val();
	var dialogID = $('.dialog-list option:selected').val();
	$('.time-info').html('');

	if (dialogID != 'dialog-all') {
		for (var i = 0; i < userList[userID][dialogID].length; i++) {
			var items = userList[userID][dialogID][i];
			var content = "<label for='content'>" + items.TIME + "</label>";
			content += "<p>" + items.TRANSCRIPT + "</p>";
			$('.time-info').append(content);
		}
	}
}