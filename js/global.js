//Main
var currLoad; //Current audio loading
var userList = {
	allUsers: []
};
var isViewAll = true;
var phraseCtrl = false;
var scrollHeight = 0;
var prevIndex = 0;



//Conditions to query for mongodb (main.js)
var statusArray = [];
var filterUserID = {
	$exists: true
};
var filterDialogID = {
	$exists: true
};
var reverse = 1;



//Google Maps
var infowindow;
var map;
var geocoder;
var markersArray = [];
var markersInfo = [];
var dialogArray = [];
var userLocation = function(pos) {
	var lat = pos.coords.latitude;
	var lng = pos.coords.longitude;
	initialize(lat, lng);
};
var error = function(error) {
	if (error.code === 1) {
		alert('Unable to get location');
	}
};