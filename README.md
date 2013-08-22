speech_web_analysis
===================

Map visualization of human dialog data.

Setup
=====
Setting up socket connections:
- Go into js/socket.js
- If running locally, use io.connect('http://localhost');
- If host on ip, use io.connect('your-ip-address');

Setting up mongoDb connection:
- Go in app.js
- Your database reference: mongoose.connect('mongodb://your-ip-address/database-name');
- Your collection reference: var collection = "your-collection-name"

Instructions 
=============
Run with nodejs:
- Enter root folder in console
- Enter "node app.js"
- Open http://localhost:8080 in browser

Summary
========
Features:
- Filters with dropdown list and checkboxes
- Click on play image to listen to transcript audio 
- Click on playlist image to listen to audios in consecutive order
- Click in textarea to edit transcript (auto save your changes to mongodb)
- Click on word in textarea and add annotation using the input field on the top right corner (work in progress).

Node Modules used: 
- express
- mongodb
- mongoose
- socket.io

APIS and library used:
- Google Maps API v3
- Jquery Livequery
