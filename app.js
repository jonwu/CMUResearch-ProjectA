  var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    path = require('path'),
    io = require('socket.io').listen(server),
    mongo = require('mongodb'),
    mongoose = require('mongoose'),
    fs = require('fs');

  //Input collection and database to use
  mongoose.connect('mongodb://209.129.244.25/speech-00');
  var collection = "HansTesting3";

  server.listen(8080);
  app.use("/", express.static(__dirname + '/'));
  app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
  });


  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("mongoDB connected");
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

  /**
   * Get transcript content from Mongodb
   * @param  {Object}   data condition for query
   * @param  {Function} cb   return data back to client
   * @return {none }        none
   */

  function getAudio(data, cb) {

    var param = "AUDIO";
    var object = {
      _id: data
    };
    items.find(object, param).execFind(function(error, response) {
      cb(response);
    });
  }

  /**
   * Update Annotation in MongoDb
   * @param  {Object} id       condition for query
   * @param  {Integer} position position of word
   * @param  {String} content  type of annotation
   * @return {none}          none
   */

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

  /**
   * Update annotation type
   * @param  {Object} id       condition for query
   * @param  {Integer} position position of the word in sentence
   * @param  {String} word     annotated word
   * @param  {String} type     type of annotation
   * @return {none}          none
   */

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
  /**
   * Update status (pending, processing, verified)
   * @param  {Object} id     condition for query
   * @param  {String} status status value to change
   * @return {none}        none
   */

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

  /**
   * Updates the transcript data in Mongodb
   * @param  {Object} id       condition for query
   * @param  {[type]} position [description]
   * @param  {String} content  transcript content
   * @return {none}          none
   */

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

  /**
   * Get DialogIds to display in dropdown menu
   * @param  {String}   userID condition for query
   * @param  {Function} cb     return data back to client
   * @return {none}          none
   */

  function getDialogList(userID, cb) {
    var conditions = {
      USERID: userID
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

  /**
   * Get UserIds to display in dropdown menu
   * @param  {String}   userID UserID
   * @param  {Function} cb     Returns list back to client
   * @return {none}          none
   */

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
  /**
   * Get all data from DB
   * @param  {Function} cb returns data to client
   * @return {none}      none
   */

  function getAllItems(cb) {
    var param = "-AUDIO";
    items.find({}, param).sort({
      TIME: 1
    }).execFind(function(error, items) {
      cb(items);
    });
  }

  /**
   * Adds annotation to text in MongoDb
   * @param {String} data_name  word is being annotated
   * @param {String} data_type  setting the type
   * @param {Integer} data_field position of the word in the sentence
   */

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

  /**
   * Retreives requested data by user
   * @param  {Object}   conditions specifies data types
   * @param  {Integer}   order      choose to sort by most recent
   * @param  {Function} cb         returns data back to client
   * @return {}              none
   */

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
      getAudio(item, function(items) {
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