if (process.env.NEW_RELIC_NO_CONFIG_FILE) {
  require("newrelic");
}

import express = require("express");
import socketIO = require("socket.io");
import http = require("http");
import cluster = require("cluster");
import sticky = require("../local_node_modules/sticky-session/lib/sticky-session");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import { getDbConnectionString } from "./getDbConnectionString";
import * as L from "./library";
import { GetPlayerViewManager } from "./playerviewmanager";
import ConfigureRoutes from "./routes";
import GetSessionMiddleware from "./session";
import ConfigureSockets from "./sockets";

async function improvedInitiativeServer() {
  const app = express();
  app.set("trust proxy", true);
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

  const defaultPort = parseInt(process.env.PORT || "80");

  if (process.env.DISABLE_CONCURRENCY) {
    await server.listen(defaultPort);
    console.log("Launched server without concurrency.");
  } else {
    await sticky.listen(server, defaultPort, {
      workers: parseInt(process.env.WEB_CONCURRENCY || "1"),
      proxyHeader: 'x-forwarded-for',
      env: {
        DB_CONNECTION_STRING: dbConnectionString,
        ...process.env
      }
    });
  }

  const io = socketIO(server);
  ConfigureSockets(io, session, playerViews);

  if (cluster.worker) {
    console.log("Improved Initiative node %s running", cluster.worker.id);
  }
}

improvedInitiativeServer();
