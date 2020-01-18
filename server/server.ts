import express = require("express");
import socketIO = require("socket.io");
import http = require("http");
import cluster = require("cluster");
import sticky = require("sticky-session");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import { getDbConnectionString } from "./getDbConnectionString";
import * as L from "./library";
import { GetPlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import GetSessionMiddleware from "./session";
import ConfigureSockets from "./sockets";

if (process.env.NEW_RELIC_NO_CONFIG_FILE) {
  require("newrelic");
}

async function improvedInitiativeServer() {
  const app = express();
  const server = new http.Server(app);

  const dbConnectionString = await getDbConnectionString();
  await DB.initialize(dbConnectionString);

  const statBlockLibrary = L.Library.FromFile<StatBlock>(
    "ogl_creatures.json",
    "/statblocks/",
    StatBlock.GetSearchHint,
    StatBlock.GetMetadata
  );
  const spellLibrary = L.Library.FromFile<Spell>(
    "ogl_spells.json",
    "/spells/",
    Spell.GetSearchHint,
    Spell.GetMetadata
  );
  const playerViews = GetPlayerViewManager();

  const session = await GetSessionMiddleware(process.env.REDIS_URL);
  app.use(session);

  ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

  const io = socketIO(server);
  ConfigureSockets(io, session, playerViews);

  const defaultPort = parseInt(process.env.PORT || "80");
  await sticky.listen(server, defaultPort);
  
  if (cluster.worker) {
    console.log("Improved Initiative node %s running", cluster.worker.id);
  }
}

improvedInitiativeServer();
