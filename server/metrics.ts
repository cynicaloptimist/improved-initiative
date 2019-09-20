import express = require("express");
import { MongoClient } from "mongodb";

const metricsDbConnectionString = process.env.METRICS_DB_CONNECTION_STRING;

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

export function configureMetricsRoutes(app: express.Application) {
  app.post("/recordEvent/:eventName", async (req: Req, res: Res) => {
    if (metricsDbConnectionString == undefined) {
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

    const client = await new MongoClient(metricsDbConnectionString).connect();
    const events = client.db().collection("events");
    await events.insertOne({
      eventName,
      eventData
    });

    return res.sendStatus(202);
  });

  app.post("/recordAnonymousEvent/:eventName", async (req: Req, res: Res) => {
    if (metricsDbConnectionString == undefined) {
      return res.status(204).send("No metrics pipeline configured.");
    }

    const eventName = req.params.eventName;
    const eventData = req.body || {};

    const client = await new MongoClient(metricsDbConnectionString).connect();
    const events = client.db().collection("events");
    await events.insertOne({
      eventName,
      eventData
    });

    return res.sendStatus(200);
  });
}
