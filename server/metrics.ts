import * as express from "express";

import axios from "axios";
import * as crypto from "crypto";
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
};

type GoogleAnalyticsEventBatch = {
  events: GoogleAnalyticsEvent[];
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

    const clientIdChanged = await DB.setGoogleAnalyticsClientId(
      session.userId,
      googleAnalyticsClientId
    );
    await flushPendingPatreonConversion(session.userId);

    if (clientIdChanged) {
      await recordServerEvent(
        ServerMetricEvent.GoogleAnalyticsClientIdRecorded,
        {},
        {
          sessionId: session.id,
          userId: session.userId,
          ipAddress: req.ip
        }
      );
    }

    return res.sendStatus(202);
  });

  app.delete("/recordGoogleAnalyticsClientId", async (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined || !session.userId) {
      return res.sendStatus(401);
    }

    await DB.clearGoogleAnalyticsClientId(session.userId);
    return res.sendStatus(204);
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
  event: GoogleAnalyticsEvent & Omit<GoogleAnalyticsEventBatch, "events">
): Promise<boolean> {
  return trackGoogleAnalyticsEvents({
    clientId: event.clientId,
    userId: event.userId,
    events: [{ name: event.name, params: event.params }]
  });
}

export async function trackGoogleAnalyticsEvents(
  eventBatch: GoogleAnalyticsEventBatch
): Promise<boolean> {
  const measurementId = process.env.GOOGLE_ANALYTICS_ID;
  const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;
  if (!measurementId || !apiSecret || !eventBatch.clientId) {
    return false;
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
        client_id: eventBatch.clientId,
        user_id: eventBatch.userId,
        events: eventBatch.events.map(event => ({
          name: event.name,
          params: event.params || {}
        }))
      },
      {
        headers: { "content-type": "application/json" }
      }
    );
    return true;
  } catch (error) {
    console.error("Failed to send Google Analytics event", error);
    return false;
  }
}

export async function flushPendingPatreonConversion(
  userId: string | import("mongodb").ObjectId
): Promise<boolean> {
  const user = await DB.claimPendingPatreonConversion(userId);
  const conversion = user?.patreonConversionTracking?.pendingConversion;
  if (!user || !conversion || !user.googleAnalyticsClientId) {
    return false;
  }

  const patreonIdHash = hashPatreonId(user.patreonId);
  const deliveryDelayMs = new Date().getTime() - conversion.observedAtMs;
  const params = {
    account_status: conversion.accountStatus,
    conversion_delivery_delay_ms: deliveryDelayMs,
    conversion_id: conversion.id,
    conversion_observed_at_ms: conversion.observedAtMs,
    lead_source: ServerMetricLeadSource.PatreonWebhook,
    patreon_event: conversion.webhookEvent,
    patreon_status_change: "started",
    previous_account_status: conversion.previousAccountStatus,
    items: [getPatreonAccountStatusItem(conversion.accountStatus)]
  };
  const sent = await trackGoogleAnalyticsEvents({
    clientId: user.googleAnalyticsClientId,
    userId: patreonIdHash,
    events: [
      { name: ServerMetricEvent.PatreonSubscriptionStarted, params },
      { name: ServerMetricEvent.CloseConvertLead, params }
    ]
  });

  if (sent) {
    await DB.completePendingPatreonConversion(user._id, conversion.id);
    console.log(
      `Sent Patreon conversion ${conversion.id} for ${patreonIdHash}`
    );
  } else {
    await DB.releasePendingPatreonConversion(user._id, conversion.id);
    console.warn(
      `Released Patreon conversion ${conversion.id} for ${patreonIdHash}`
    );
  }

  return sent;
}

function getPatreonAccountStatusItem(accountStatus: string) {
  return {
    item_id: `patreon_${accountStatus}`,
    item_name: `Patreon ${accountStatus}`
  };
}

function hashPatreonId(patreonId: string): string {
  return crypto
    .createHash("sha256")
    .update(patreonId)
    .digest("hex")
    .substring(0, 36);
}

function isValidGoogleAnalyticsClientId(clientId: any): clientId is string {
  return (
    typeof clientId === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(clientId)
  );
}
