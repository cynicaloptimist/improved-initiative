import express = require("express");
import { MongoClient } from "mongodb";

let dbClient: MongoClient | null = null;
if (process.env.METRICS_DB_CONNECTION_STRING != undefined) {
  new MongoClient(process.env.METRICS_DB_CONNECTION_STRING)
    .connect()
    .then(client => (dbClient = client));
}

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

export function configureMetricsRoutes(app: express.Application) {
  app.post("/recordEvent/:eventName", async (req: Req, res: Res) => {
    if (dbClient == null) {
      return res.status(204).send("No metrics pipeline configured.");
    }

    let session = req.session;
    if (session === undefined) {
      throw "Session is undefined.";
    }

    const eventName = req.params.eventName;
    const eventData = req.body || {};
    eventData.sessionId = session.id;
    eventData.userId = session.userId || null;
    eventData.ipAddress = req.ip;

    await dbClient
      .db()
      .collection("events")
      .insertOne({
        eventName,
        eventData
      });

    return res.sendStatus(202);
  });

  app.post("/recordAnonymousEvent/:eventName", async (req: Req, res: Res) => {
    if (dbClient == null) {
      return res.status(204).send("No metrics pipeline configured.");
    }

    const eventName = req.params.eventName;
    const eventData = req.body || {};

    await dbClient
      .db()
      .collection("events")
      .insertOne({
        eventName,
        eventData
      });

    return res.sendStatus(200);
  });
}
