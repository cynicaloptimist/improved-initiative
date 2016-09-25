/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />
/// <reference path="../typings/globals/applicationinsights/index.d.ts" />

import socketIO = require('socket.io');
import appInsights = require('applicationinsights');
import express = require('express');

import ConfigureRoutes from './routes';
import LoadCreatures from './loadcreatures';
import ConfigureSockets from './sockets';

var app = express();
var http = require('http').Server(app);
var io = socketIO(http);

var port = process.env.PORT || 80;
var playerViews = [];
var creatures = [];

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup().start();
}

LoadCreatures(creatures);
ConfigureRoutes(app, creatures, playerViews);
ConfigureSockets(io, playerViews);

var server = http.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Improved Initiative listening at http://%s:%s', host, port);
});