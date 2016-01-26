/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />
var fs = require('fs');
var express = require('express');
var socketIO = require('socket.io');
var argv = require('minimist')(process.argv.slice(2));
var app = express();
var http = require('http').Server(app);
var io = socketIO(http);
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var port = process.env.PORT || 80;
var playerViews = [];
var creatures = [];
var playerCharacters = [];
var importCreatureLibrary = function (filename) { return fs.readFile(filename, function (err, buffer) {
    if (err) {
        throw "Couldn't read creature library " + filename + ": " + err;
    }
    creatures = creatures.concat(JSON.parse(buffer.toString()));
}); };
if (argv.f) {
    fs.stat(argv.f, function (err, stats) {
        if (err) {
            throw "couldn't access " + argv.f;
        }
        if (stats.isDirectory()) {
            fs.readdir(argv.f, function (err, fileNames) {
                if (err) {
                    throw "couldn't read directory " + argv.f;
                }
                fileNames.forEach(function (fileName) {
                    importCreatureLibrary(argv.f + '/' + fileName);
                });
            });
        }
        else {
            importCreatureLibrary(argv.f);
        }
    });
}
else {
    importCreatureLibrary('ogl_creatures.json');
}
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