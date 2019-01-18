import express = require("express");
import socketIO = require("socket.io");
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import LaunchServer from "./launchserver";
import * as L from "./library";
import { PlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import ConfigureSessions from "./session";
import ConfigureSockets from "./sockets";

async function improvedInitiativeServer() {
  const app = express();
  const http = require("http").Server(app);

  await DB.initialize(process.env.DB_CONNECTION_STRING);

  const statBlockLibrary = L.Library.FromFile<StatBlock>(
    "ogl_creatures.json",
    "/statblocks/",
    StatBlock.GetKeywords
  );
  const spellLibrary = L.Library.FromFile<Spell>(
    "ogl_spells.json",
    "/spells/",
    Spell.GetKeywords
  );
  const playerViews = new PlayerViewManager();

  await ConfigureSessions(app, process.env.DB_CONNECTION_STRING);
  ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

  const io = socketIO(http);
  ConfigureSockets(io, playerViews);

  LaunchServer(http);
}

improvedInitiativeServer();
