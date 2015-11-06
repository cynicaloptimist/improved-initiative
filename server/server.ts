/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />

import express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var port = process.env.PORT || 80;
var encounters = [];
var newEncounterIndex = (): number => {
	var newEncounterId = encounters.length;
	encounters[newEncounterId] = {};
	return newEncounterId;
}

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/');

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.redirect('e/' + newEncounterIndex());
});

app.get('/e/:id', (req, res) => {
	console.log('app.get ' + req.path);
	res.render('index', { 
		rootDirectory	: "..", 
		encounterId: req.params.id 
	})
})

app.get('/p/:id', (req, res) => {
	console.log('app.get ' + req.path);
	res.render('playerview', { 
		rootDirectory	: "..", 
		encounterId: req.params.id 
	})
})

app.route('/encounters/:id')
.get((req, res) => {
	res.json(encounters[req.params.id])
})
.post((req, res) => {
	encounters[req.params.id] = req.body;
	res.status(200).end();
})

io.on('connection', function(socket){
  	console.log('a user connected');
	socket.on('update encounter', function(encounter){
		console.log('encounter: ' + JSON.stringify(encounter));
		io.emit('update encounter', encounter);
	});
});

var server = http.listen(port, function() {
	var host = server.address().address;
  	var port = server.address().port;

	console.log('Improved Initiative listening at http://%s:%s', host, port);
});