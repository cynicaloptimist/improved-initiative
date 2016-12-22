/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/index.d.ts" />

import socketIO = require('socket.io');
import express = require('express');

import ConfigureAppInsights from './configureappinsights';
import ConfigureRoutes from './routes';
import StatBlockLibrary from './statblocklibrary';
import ConfigureSockets from './sockets';
import LaunchServer from './launchserver';

ConfigureAppInsights();

const creatureLibrary = StatBlockLibrary.FromFile('ogl_creatures.json');
const playerViews = [];

const app = express();
const http = require('http').Server(app);

ConfigureRoutes(app, creatureLibrary, playerViews);

const io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);