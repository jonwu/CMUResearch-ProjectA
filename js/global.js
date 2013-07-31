var cache = [];
var currLoad;
var userList = {
	allUsers: []
};
var isViewAll = true;
var phraseCtrl = false;
var scrollHeight = 0;
var prevIndex = 0;


//Filters
var statusArray = [];
var filterUserID = {$exists:true};
var filterDialogID = {$exists:true}; 
var reverse = 1;
