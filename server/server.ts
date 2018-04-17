import express = require("express");
import socketIO = require("socket.io");
import { Spell } from "../client/Spell/Spell";
import { StatBlock } from "../client/StatBlock/StatBlock";
import * as DB from "./dbconnection";
import LaunchServer from "./launchserver";
import * as L from "./library";
import { PlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import ConfigureSockets from "./sockets";

const app = express();
const http = require("http").Server(app);
DB.initialize();

const statBlockLibrary = L.Library.FromFile<StatBlock>("ogl_creatures.json", "/statblocks/", StatBlock.GetKeywords);
const spellLibrary = L.Library.FromFile<Spell>("ogl_spells.json", "/spells/", Spell.GetKeywords);
const playerViews = new PlayerViewManager();
ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

const io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);