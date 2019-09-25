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

    const name = req.params.eventName;
    const eventData = req.body.eventData || {};
    const meta = {
      ...req.body.meta,
      sessionId: session.id,
      userId: session.userId || null,
      ipAddress: req.ip,
      serverTime: new Date().getTime(),
      anonymous: false
    };

    await dbClient
      .db()
      .collection("events")
      .insertOne({
        name,
        eventData,
        meta
      });

    return res.sendStatus(202);
  });

  app.post("/recordAnonymousEvent/:eventName", async (req: Req, res: Res) => {
    if (dbClient == null) {
      return res.status(204).send("No metrics pipeline configured.");
    }

    const eventName = req.params.eventName;
    const eventData = req.body.eventData || {};
    const meta = {
      ...req.body.meta,
      serverTime: new Date().getTime(),
      anonymous: true
    };

    await dbClient
      .db()
      .collection("events")
      .insertOne({
        eventName,
        eventData,
        meta
      });

    return res.sendStatus(200);
  });
}
