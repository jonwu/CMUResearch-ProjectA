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
    getTranscript();
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


  function getTranscript() {

    var param = "AUDIO";
    var object = {};

    items.find(object, param).sort({TIME:-1}).limit(1).execFind(function(error, response) {
      // console.log(response[0].AUDIO);
      var base64Data = new Buffer(response[0].AUDIO, 'base64');
      require("fs").writeFile("out.wav", base64Data, 'base64', function(err) {
        console.log(err);
      });
    });
  }
  function addOne(object){
    var item = new items(object);
    item.save(function(error){
      if (error) {
        console.log("ERROR");
      }
      else {
        console.log("SUCCESS");
      }
    });
  }