var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  path = require('path'),
  io = require('socket.io').listen(server),
  mongo = require('mongodb'),
  mongoose = require('mongoose'),
  Grid = require('gridfs-stream'),
  fs = require('fs');

var BSON = mongo.BSONPure;
// var collection = "data";
var collection = "HansTesting";
server.listen(8080);
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));

// app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});


mongoose.connect('mongodb://209.129.244.25/speech-00');
// mongoose.connect('mongodb://localhost/speech-00');
var db = mongoose.connection;
var buffer = "";
var gfs;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongoDB connected");
  // insertAudio();
});

var scheme = mongoose.Schema({
  ANNOTATION: Array,
  FILENAME: String,
  USERID: String,
  INTERACTION: String,
  DATE: String,
  TIME: String,
  LATITUDE: String,
  LONGITUDE: String,
  TRANSCRIPT: String,
  AUDIO: String

});
var items = mongoose.model('items', scheme, collection);

function insertAudio() {
  var object = {};
  items.find(object, function(error, items) {
    for (var i = 0; i < items.length; i++) {
      var filename = "audio/" + items[i].FILENAME;
      insertFile(filename, items[i].FILENAME);
    }
  });

}

function insertFile(filename, name) {
  // console.log(filename);
  fs.readFile(filename, function(err, original_data) {
    console.log(original_data);
    if (original_data) {
      var base64Image = original_data.toString('base64');
      // var data = new BSON.Binary(base64Image);
      var conditions = {
        FILENAME: name
      };
      var update = {
        $set: {
          AUDIO: base64Image
        }
      };
      var options = {
        upsert: true
      };
      var callback = function(error) {
        console.log("success");
      };
      items.update(conditions, update, options, callback);
    }
  });
}

function getTranscript(data, cb) {

  var param = "AUDIO";
  var object = {
    _id: data
  };
  items.find(object, param).execFind(function(error, response) {
    cb(response);
  });
}

function getAudio(data, cb) {
  var ids = [];
  for (var i = 0; i < data.length; i++) {
    ids.push(data[i]._id);
  }
  var param = "";
  var object = {
    _id: {
      $in: ids
    }
  };
  items.find(object, param).sort({
    TIME: 1
  }).execFind(function(error, response) {
    cb(response);
  });
}


function insertItem(nameItem, foodItem) {

  var object = {
    DATE: nameItem,
    TIME: foodItem
  };

  var item = new items(object);
  item.save(function(error) {
    if (error) {
      console.log("failed data input");
    } else {
      console.log("succesful data input");
    }
  });
}

function getItem(key, cb) {
  var object = {
    name: key
  };
  items.find(object, function(error, items) {
    console.log(items);
    cb(items);
  });
}

function updateItems(item_name, item_type) {
  console.log("items", item_name);
  console.log("items", item_type);
  var conditions = {
    name: item_name
  };
  var update = {
    $set: {
      type: item_type
    }
  };
  var options = {
    upsert: true
  };
  var callback = function(error) {
    console.log("success");
  };
  items.update(conditions, update, options, callback);
}

function getAllItems(cb) {
  var param = "-AUDIO";
  items.find({}, param).sort({
    TIME: 1
  }).execFind(function(error, items) {
    cb(items);
  });
}

function addAnnotation(data_name, data_type, data_field) {

  var info = {
    name: data_name,
    type: data_type,
    position: data_field
  }
  var conditions = {
    _id: "51dc9f908bbd955c2edd00c7"
  };
  var update = {
    $set: {
      ANNOTATION: []
    }
  };
  var options = {
    upsert: true
  };
  var callback = function(error) {
    if (error)
      console.log(error);
    console.log("success");
  };
  items.update(conditions, update, options, callback);
}

io.sockets.on('connection', function(socket) {
  
  // Get all data when client starts
  socket.on('getAllData', function() {
    getAllItems(function(items) {
      socket.emit('setMarkers', items);
    });
  });

  // Deprecated
  socket.on('setWord', function(key) {
    getItem(key, function(item) {
      socket.emit('getWord', item);
    });
  });

  // Deprecated
  socket.on('updateItem', function(name, type) {
    updateItems(name, type);
  });

  // Get an audio file back to client
  socket.on('getAudio', function(item) {
    getTranscript(item, function(items) {
      socket.emit('setAudios', items[0].AUDIO);
    });
  });

  socket.on('disconnect', function() {});

});