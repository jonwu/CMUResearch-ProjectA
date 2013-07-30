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

		clearOverlays();
		var userID = $('.user-list').val();
		socket.emit('getDialogList', userID);

		if ($(this).val() == 'user-all') {
			socket.emit("getAllData");
		} else {
			showAllDialogs(userID);
		}
	});
	$(".dialog-list").change(function() {
		clearOverlays();
		setDialogInfo();

		if ($(this).val() == 'dialog-all') {
			var userID = $('.user-list').val();
			showAllDialogs(userID);
		}

	});
	
	$('.reverse:checkbox').change(
		function() {
			if ($(this).is(':checked')) {
				stopAudio();
				$('.dialog-info').html('');
				setReverseInfo(dialogArray);
			} else {
				stopAudio();
				$('.dialog-info').html('');
				setInfo(dialogArray);
			}
		});
	$('.type-add').on('click', function() {
		$('.selected').each(function(index) {

			var id = $(this).parents('.message').attr('val')
			var position = $(this).attr('val');
			var word = $(this).text();
			var type = $('.type-input').val();

			socket.emit('setTypes', id, position, word, type);
		});
	});
});

$(".main-marker").livequery(function() {
	$('input:radio').change(function(){
		var id = $(this).attr('name');
		var value = $(this).val();
		console.log(id);
		console.log(value);
		socket.emit('updateStatus', id, value); 
	});
	$('.main-transcript span').hover(function() {
		var currWord = $(this).text();
	}, function() {});

	$('.main-transcript span').on('click', function() {
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

	$('.main-loading').on('click', function() {

		$('.audio-active').removeClass('audio-active');
		currLoad = $(this).parents('.message');
		console.log('curload', currLoad);
		var _id = $(currLoad).attr('val');
		socket.emit('getAudio', _id, true);
	});
	$('.main-play').on('click', function() {
		$('.audio-active').removeClass('audio-active');
		currLoad = $(this).parents('.message');
		var _id = $(currLoad).attr('val');
		socket.emit('getAudio', _id, false);
	});

	//Edit subscript
	$(".subtype").blur(function() {
		var content = $(this).text();
		var id = $(this).attr('val');
		var position = $(this).prev().attr('val');
		socket.emit('updateSub', id, position, content);
	});

	//Edit Words
	$(".transcript").blur(function() {
		var content = "";
		var position = $(this).attr('val');
		var id = $(this).parents('.message').attr('val');

		console.log('content', content);
		console.log('userID', id);
		console.log('pos', position);
		content = $(this).text();
		content = $.trim(content);
		console.log(content);
		socket.emit('updateTranscript', id, position, content);
	});

	$('.audio').click(function() {
		if (this.paused == false) {
			markersArray[prevIndex].setIcon('../img/non-active.png');
		} else {
			setActiveMarker();
		}
	});


});