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