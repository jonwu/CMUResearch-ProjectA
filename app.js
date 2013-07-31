  var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    path = require('path'),
    io = require('socket.io').listen(server),
    mongo = require('mongodb'),
    mongoose = require('mongoose'),
    fs = require('fs');


  // var collection = "data";
  var collection = "HansTesting3";
  mongoose.connect('mongodb://209.129.244.25/speech-00');
  // mongoose.connect('mongodb://localhost/speech-00');

  server.listen(8080);
  app.use("/js", express.static(__dirname + '/js'));
  app.use("/css", express.static(__dirname + '/css'));
  app.use("/img", express.static(__dirname + '/img'));

  // app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
  });


  var db = mongoose.connection;
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
    AUDIO: String,
    STATUS: String
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
      // console.log(response[0].AUDIO);
      // var base64Data = new Buffer(response[0].AUDIO, 'base64');
      // require("fs").writeFile("out.wav", base64Data, 'base64', function(err) {
      //     console.log(err);
      // });
      cb(response);
    });
  }

  function updateAnnotation(id, position, content) {
    console.log("inside annotation");
    var conditions = {
      _id: id,
      'ANNOTATION.position': parseInt(position)
    };

    var update = {
      $set: {
        'ANNOTATION.$.type': content
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


  function updateType(id, position, word, type) {
    var conditions = {
      _id: id,
      'ANNOTATION.position': parseInt(position)
    };
    items.find(conditions, function(error, data) {
      console.log(data.length);
      if (data.length) {
        //Update Annotation if it exists
        updateAnnotation(id, position, type);
      } else {
        //   console.log("inside annotation");
        var newType = {
          name: word,
          position: parseInt(position),
          type: type
        }
        conditions = {
          _id: id
        };
        var update = {
          $addToSet: {
            ANNOTATION: newType
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

  function updateStatus(id, status) {
    var conditions = {
      _id: id
    };
    items.find(conditions, function(error, data) {
      var conditions = {
        _id: id
      };
      var update = {
        $set: {
          STATUS: status
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

  function updateTranscript(id, position, content) {
    var conditions = {
      _id: id
    };
    items.find(conditions, function(error, data) {
      if (content != data[0].TRANSCRIPT) {
        var conditions = {
          _id: id
        };
        var update = {
          $set: {
            TRANSCRIPT: content,
            ANNOTATION: []
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


  function getDialogList(userID, cb) {
    var conditions = {
      USERID: userID
      // USERID: parseInt(userID)
    };
    var param = "-AUDIO";
    var distinct = 'INTERACTION';
    items.find(conditions, param).sort({
      TIME: 1
    }).distinct(distinct, function(error, items) {
      console.log('items', items);
      cb(items);
    });
  }

  function getUserList(userID, cb) {
    var conditions = {};
    var param = "-AUDIO";
    var distinct = 'USERID';
    items.find(conditions, param).sort({
      TIME: 1
    }).distinct(distinct, function(error, items) {
      console.log('items', items);
      cb(items);
    });
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

  function getData(conditions, order, cb) {
    var param = "-AUDIO";
    console.log(conditions);
    items.find(conditions, param).sort({
      TIME: order
    }).execFind(function(error, data) {
      cb(data);
    });
  }

  io.sockets.on('connection', function(socket) {

    // Get all data when client starts
    socket.on('getAllData', function() {
      getAllItems(function(items) {
        socket.emit('setMarkers', items);
      });
    });

    // Get an audio file back to client
    socket.on('getAudio', function(item, loop) {
      getTranscript(item, function(items) {
        socket.emit('setAudios', items[0].AUDIO, loop);
      });
    });
    socket.on('updateSub', function(id, position, content) {
      updateAnnotation(id, position, content);
    });
    socket.on('setTypes', function(id, position, word, type) {
      updateType(id, position, word, type);
    });
    socket.on('updateTranscript', function(id, position, content) {
      updateTranscript(id, position, content);
    });
    socket.on('updateStatus', function(id, status) {
      updateStatus(id, status);
    });

    socket.on('getDialogList', function(userID) {
      getDialogList(userID, function(items) {
        socket.emit('setDialogList', items);
      });
    });
    socket.on('getUserList', function(userID) {
      getUserList(userID, function(items) {
        socket.emit('setUserList', items);
      });
    });
    socket.on('getData', function(conditions, order) {
      getData(conditions, order, function(data) {
        socket.emit('setData', data);
      });
    });
    socket.on('disconnect', function() {});

  });