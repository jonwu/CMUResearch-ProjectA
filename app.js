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

server.listen(8080);
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));

// app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});


// mongoose.connect('mongodb://209.129.244.25/speech-00');
mongoose.connect('mongodb://localhost/speech-00');
var db = mongoose.connection;
var buffer = "";
var gfs;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mongoDB connected");
  // gfs = Grid(db.db, mongoose.mongo);
  // app.get('/download', function(req, res) {
  //   // TODO: set proper mime type + filename, handle errors, etc...
  //   var readStream = gfs.createReadStream({
  //     filename: 'baby.mp3'
  //   });
  //   readStream.pipe(res);
  // });

  // readStream.on("data", function(chunk) {
  //   buffer += chunk;
  // });
  // readStream.on("end", function() {
  //   console.log("contents of file:\n\n", buffer);
  //   // socket.emit("getAudio",buffer);
  // });


  // var writestream = gfs.createWriteStream({filename: 'baby.mp3'});
  // fs.createReadStream('baby.mp3').pipe(writestream);
  // fs.readFile("baby.mp3", function(err, original_data) {
  //   var base64Image = original_data.toString('base64');
  //   var decodedImage = new Buffer(base64Image, 'base64');
  //   fs.writeFile('baby_new.mp3', decodedImage, function(err) {

  //   });
  // });
  // insertAudio();
  // getAudio();
  // insertItem('test','test');

});

var scheme = mongoose.Schema({
  // ANNOTATION: Array,
  FILENAME: String,
  USERID: Number,
  INTERACTION: String,
  DATE: String,
  TIME: String,
  LATITUDE: String,
  LONGITUDE: String,
  TRANSCRIPT: String,
  AUDIO: String

});
var items = mongoose.model('items', scheme, 'data');

function insertAudio() {
  var object = {};
  items.find(object, function(error, items) {
    for (var i = 0; i < items.length; i++) {
      var filename = "audio/" + items[i].FILENAME;
      // console.log(filename);
      insertFile(filename, items[i].FILENAME);
    }
  });

}

function insertFile(filename, name) {
  // console.log(filename);
  fs.readFile(filename, function(err, original_data) {
    var base64Image = original_data.toString('base64');
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
  });
}

function getAudio(cb) {
  var object = {};
  items.find(object, function(error, items) {
    cb(items);
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
  items.find({}).sort({
    TIME: 1
  }).execFind(function(error, items) {
    cb(items);
  });
  console.log("run updates");
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
// addAnnotation("sushi", "food", "4");

io.sockets.on('connection', function(socket) {
  socket.on('getAllData', function() {
    getAllItems(function(items) {
      socket.emit('setMarkers', items);
    });
    getAudio(function(items) {
      socket.emit('setAudio', items);
    });
  });
  // when the client emits 'sendchat', this listens and executes
  socket.on('setWord', function(key) {
    getItem(key, function(item) {
      socket.emit('getWord', item);
    });
  });

  // when the client emits 'adduser', this listens and executes
  socket.on('updateItem', function(name, type) {
    updateItems(name, type);
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', function() {});
});