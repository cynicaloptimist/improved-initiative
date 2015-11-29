/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />

import express = require('express');
var app = express();
var http = require('http').Server(app);
var io: SocketIO.Server = require('socket.io')(http);
var fs = require('fs');

var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var port = process.env.PORT || 80;
var playerViews = [];
var creatures = [];

fs.readFile('public/basic_rules_creatures.json', (err, json) => {
	if(err){
		throw `Couldn't read creature library: ${err}`;
	}
	creatures = JSON.parse(json);
});

var newEncounterIndex = (): number => {
	var newEncounterId = playerViews.length;
	playerViews[newEncounterId] = {};
	return newEncounterId;
}

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.redirect('e/' + newEncounterIndex());
});

app.get('/e/:id', (req, res) => {
	console.log('app.get ' + req.path);
	res.render('index', { 
		rootDirectory	: "..", 
		encounterId: req.params.id,
	})
})

app.get('/p/:id', (req, res) => {
	console.log('app.get ' + req.path);
	res.render('playerview', { 
		rootDirectory	: "..", 
		encounterId: req.params.id
	})
})

app.get('/playerviews/:id', (req, res) => {
	res.json(playerViews[req.params.id]);
})

app.get('/creatures/', (req, res) => {
	res.json(creatures.map((creature, index) => {
		return { "Id": index, "Name": creature.Name }
	}));
})

io.on('connection', function(socket){
  	console.log('a user connected');
	socket.on('update encounter', function(id, encounter){
		socket.join(id);
		console.log('encounter: ' + JSON.stringify(encounter));
		playerViews[id] = encounter;
		socket.broadcast.to(id).emit('update encounter', encounter);
	});
	socket.on('join encounter', function(id){
		console.log(`encounter ${id} joined`);
		socket.join(id);
	})
});

var server = http.listen(port, function() {
	var host = server.address().address;
  	var port = server.address().port;

	console.log('Improved Initiative listening at http://%s:%s', host, port);
});