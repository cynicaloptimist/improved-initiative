/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var port = process.env.PORT || 80;
var playerViews = [];
var creatures = [];
var playerCharacters = [];
fs.access('public/user/creatures.json', fs.R_OK, function (err) {
    if (err) {
        fs.readFile('public/ogl_creatures.json', function (err, json) {
            if (err) {
                throw "Couldn't read creature library: " + err;
            }
            creatures = creatures.concat(JSON.parse(json));
        });
    }
    else {
        fs.readFile('public/user/creatures.json', function (err, json) {
            if (err) {
                throw "Couldn't read creature library: " + err;
            }
            creatures = creatures.concat(JSON.parse(json));
        });
    }
});
fs.readFile('public/user/custom-creatures.json', function (err, json) {
    if (err) {
        return;
    }
    creatures = creatures.concat(JSON.parse(json));
});
fs.readFile('public/user/playercharacters.json', function (err, json) {
    if (err) {
        return;
    }
    playerCharacters = playerCharacters.concat(JSON.parse(json));
});
var newEncounterIndex = function () {
    var newEncounterId = playerViews.length;
    playerViews[newEncounterId] = {};
    return newEncounterId;
};
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.redirect('e/' + newEncounterIndex());
});
app.get('/e/:id', function (req, res) {
    console.log('app.get ' + req.path);
    res.render('index', {
        rootDirectory: "..",
        encounterId: req.params.id,
    });
});
app.get('/p/:id', function (req, res) {
    console.log('app.get ' + req.path);
    res.render('playerview', {
        rootDirectory: "..",
        encounterId: req.params.id
    });
});
app.get('/playerviews/:id', function (req, res) {
    res.json(playerViews[req.params.id]);
});
app.get('/creatures/', function (req, res) {
    res.json(creatures.map(function (creature, index) {
        return { "Id": index, "Name": creature.Name, "Type": creature.Type, "Link": "/creatures/" + index };
    }));
});
app.get('/creatures/:id', function (req, res) {
    res.json(creatures[req.params.id]);
});
app.get('/playercharacters/', function (req, res) {
    res.json(playerCharacters.map(function (playercharacter, index) {
        return { "Id": index, "Name": playercharacter.Name, "Type": playercharacter.Type, "Link": "/playercharacters/" + index };
    }));
});
app.post('/playercharacters/', function (req, res) {
    console.log(req.body);
    if (req.body) {
        res.send({ Id: playerCharacters.push(req.body) });
    }
    res.end();
});
app.get('/playercharacters/:id', function (req, res) {
    res.json(playerCharacters[req.params.id]);
});
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('update encounter', function (id, encounter) {
        socket.join(id);
        console.log('encounter: ' + JSON.stringify(encounter));
        playerViews[id] = encounter;
        socket.broadcast.to(id).emit('update encounter', encounter);
    });
    socket.on('join encounter', function (id) {
        console.log("encounter " + id + " joined");
        socket.join(id);
    });
});
var server = http.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Improved Initiative listening at http://%s:%s', host, port);
});
//# sourceMappingURL=server.js.map