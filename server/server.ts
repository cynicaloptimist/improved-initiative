/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/globals/socket.io/index.d.ts" />
/// <reference path="../typings/globals/applicationinsights/index.d.ts" />

import socketIO = require('socket.io');
import express = require('express');

import ConfigureAppInsights from './configureappinsights';
import ConfigureRoutes from './routes';
import LoadCreatures from './loadcreatures';
import ConfigureSockets from './sockets';
import LaunchServer from './launchserver';

ConfigureAppInsights();

var creatureLibrary = [];
var playerViews = [];

LoadCreatures(creatureLibrary);

var app = express();
var http = require('http').Server(app);

ConfigureRoutes(app, creatureLibrary, playerViews);

var io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);