import * as express from "express";

import axios from "axios";
import { MongoClient } from "mongodb";
import * as DB from "./dbconnection";

let dbClient: MongoClient | null = null;
if (process.env.METRICS_DB_CONNECTION_STRING != undefined) {
  new MongoClient(process.env.METRICS_DB_CONNECTION_STRING)
    .connect()
    .then(client => (dbClient = client));
}

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

type ServerEventMeta = {
  [key: string]: any;
};

type GoogleAnalyticsEvent = {
  name: ServerMetricEvent;
  params?: Record<string, any>;
  clientId?: string;
  userId?: string;
};

export enum ServerMetricEvent {
  CloseConvertLead = "close_convert_lead",
  GoogleAnalyticsClientIdRecorded = "google_analytics_client_id_recorded",
  PatreonSubscriptionCancelled = "patreon_subscription_cancelled",
  PatreonSubscriptionChanged = "patreon_subscription_changed",
  PatreonSubscriptionStarted = "patreon_subscription_started"
}

export enum ServerMetricLeadSource {
  PatreonWebhook = "patreon_webhook"
}

export function configureMetricsRoutes(app: express.Application) {
  app.post("/recordEvent/:eventName", async (req: Req, res: Res) => {
    if (dbClient == null) {
      return res.status(204).send("No metrics pipeline configured.");
    }

    const session = req.session;
    if (session === undefined) {
      throw "Session is undefined.";
    }

    const eventName = req.params.eventName;
    const eventData = req.body.eventData || {};
    const meta = {
      ...req.body.meta,
      sessionId: session.id,
      userId: session.userId || null,
      ipAddress: req.ip,
      serverTime: new Date().getTime(),
      anonymous: false
    };

    await dbClient.db().collection("events").insertOne({
      eventName,
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

    await dbClient.db().collection("events").insertOne({
      eventName,
      eventData,
      meta
    });

    return res.sendStatus(200);
  });

  app.post("/recordGoogleAnalyticsClientId", async (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined || !session.userId) {
      return res.sendStatus(401);
    }

    const googleAnalyticsClientId = req.body.googleAnalyticsClientId;
    if (!isValidGoogleAnalyticsClientId(googleAnalyticsClientId)) {
      return res.status(400).send("Invalid Google Analytics client id.");
    }

    await DB.setGoogleAnalyticsClientId(
      session.userId,
      googleAnalyticsClientId
    );

    await recordServerEvent(
      ServerMetricEvent.GoogleAnalyticsClientIdRecorded,
      {},
      {
        sessionId: session.id,
        userId: session.userId,
        ipAddress: req.ip
      }
    );

    return res.sendStatus(202);
  });
}

export async function recordServerEvent(
  eventName: ServerMetricEvent,
  eventData: Record<string, any>,
  meta: ServerEventMeta = {}
): Promise<void> {
  if (dbClient == null) {
    return;
  }

  try {
    await dbClient
      .db()
      .collection("events")
      .insertOne({
        eventName,
        eventData,
        meta: {
          ...meta,
          serverTime: new Date().getTime(),
          serverSide: true
        }
      });
  } catch (error) {
    console.error("Failed to record server event", error);
  }
}

export async function trackGoogleAnalyticsEvent(
  event: GoogleAnalyticsEvent
): Promise<void> {
  const measurementId = process.env.GOOGLE_ANALYTICS_ID;
  const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;
  if (!measurementId || !apiSecret || !event.clientId) {
    return;
  }

  const endpoint =
    process.env.GOOGLE_ANALYTICS_MP_ENDPOINT ||
    "https://www.google-analytics.com/mp/collect";
  const url =
    endpoint +
    `?measurement_id=${encodeURIComponent(measurementId)}` +
    `&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    await axios.post(
      url,
      {
        client_id: event.clientId,
        user_id: event.userId,
        events: [
          {
            name: event.name,
            params: event.params || {}
          }
        ]
      },
      {
        headers: { "content-type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Failed to send Google Analytics event", error);
  }
}

function isValidGoogleAnalyticsClientId(clientId: any): clientId is string {
  return (
    typeof clientId === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(clientId)
  );
}
