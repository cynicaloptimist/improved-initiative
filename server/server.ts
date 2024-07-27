import * as express from "express";

import * as SocketIO from "socket.io";
import * as http from "http";

import * as cluster from "cluster";

import * as DB from "./dbconnection";
import { getDbConnectionString } from "./getDbConnectionString";
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

  const playerViews = await GetPlayerViewManager();

  const session = await GetSessionMiddleware(process.env.REDIS_URL);
  app.use(session);

  ConfigureRoutes(app, playerViews);

  const defaultPort = parseInt(process.env.PORT || "80");

  await server.listen(defaultPort);
  console.log("Launched server.");

  const io = new SocketIO.Server(server);
  ConfigureSockets(io, session, playerViews);

  if (cluster.worker) {
    console.log("Improved Initiative node %s running", cluster.worker.id);
  }
}

improvedInitiativeServer();
