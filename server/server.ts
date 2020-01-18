import express = require("express");
import socketIO = require("socket.io");
import http = require("http");
import cluster = require("cluster");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import { getDbConnectionString } from "./getDbConnectionString";
import * as L from "./library";
import { GetPlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import GetSessionMiddleware from "./session";
import ConfigureSockets from "./sockets";
import { AddressInfo } from "net";

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

  const defaultPort = process.env.PORT || 80;
  server.listen(defaultPort, () => {
    const address = server.address() as AddressInfo;
    console.log("Improved Initiative listening at http://%s:%s", address.address, address.port);
  });
}

const num_processes = require("os").cpus().length;
if (cluster.isMaster) {
  for (var i = 0; i < num_processes; i++) {
    cluster.fork();
  }
} else {
  improvedInitiativeServer();
}
