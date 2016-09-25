/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/socket.io/socket.io.d.ts" />
/// <reference path="../typings/globals/applicationinsights/index.d.ts" />

import socketIO = require('socket.io');
import express = require('express');

import ConfigureAppInsights from './configureappinsights';
import ConfigureRoutes from './routes';
import LoadCreatures from './loadcreatures';
import ConfigureSockets from './sockets';
import LaunchServer from './launchserver';

ConfigureAppInsights();

var creatures = [];
var playerViews = [];

LoadCreatures(creatures);

var app = express();
var http = require('http').Server(app);

ConfigureRoutes(app, creatures, playerViews);

var io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);