import express = require("express");
import socketIO = require("socket.io");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import { getDbConnectionString } from "./getDbConnectionString";
import LaunchServer from "./launchserver";
import * as L from "./library";
import { PlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import GetSessionMiddleware from "./session";
import ConfigureSockets from "./sockets";

async function improvedInitiativeServer() {
  const app = express();
  const http = require("http").Server(app);

  const dbConnectionString = await getDbConnectionString();
  await DB.initialize(dbConnectionString);

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

  const session = await GetSessionMiddleware(dbConnectionString);
  app.use(session);

  ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

  const io = socketIO(http);
  ConfigureSockets(io, session, playerViews);

  LaunchServer(http);
}

improvedInitiativeServer();
