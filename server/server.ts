import socketIO = require("socket.io");
import express = require("express");

import LaunchServer from "./launchserver";
import ConfigureRoutes from "./routes";
import ConfigureSockets from "./sockets";
import * as L from "./library";
import * as DB from "./dbconnection";
import { StatBlock } from "../client/StatBlock/StatBlock";

const app = express();
const http = require("http").Server(app);
DB.initialize();

const statBlockLibrary = L.Library.FromFile<StatBlock>("ogl_creatures.json", "/statblocks/", StatBlock.GetKeywords);
const spellLibrary = L.Library.FromFile<L.Spell>("ogl_spells.json", "/spells/", L.GetSpellKeywords);
const playerViews = [];
ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

const io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);