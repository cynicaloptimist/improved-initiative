import bodyParser = require("body-parser");
import * as express from "express";

import * as moment from "moment";

import mustacheExpress = require("mustache-express");
import { URL } from "url";

import { ClientEnvironment } from "../common/ClientEnvironment";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { configureBasicRulesContent } from "./configureBasicRulesContent";
import { getAccount, upsertUser } from "./dbconnection";
import { configureMetricsRoutes } from "./metrics";
import {
  configureLoginRedirect,
  configureLogout,
  configurePatreonWebhookReceiver,
  startNewsUpdates,
  updateSessionAccountFeatures
} from "./patreon";
import { PlayerViewManager } from "./playerviewmanager";
import configureStorageRoutes from "./storageroutes";
import { AccountStatus } from "./user";
import { configureOpen5eContent } from "./configureOpen5eContent";
import { configureAffiliateRoutes } from "./configureAffiliateRoutes";
import request = require("request");
import { configureImportRoutes } from "./configureImportRoutes";

const baseUrl = process.env.BASE_URL || "";
const patreonClientId = process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID";
const defaultAccountLevel = process.env.DEFAULT_ACCOUNT_LEVEL || "free";
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || "";

export type Req = Express.Request & express.Request;
export type Res = Express.Response & express.Response;

const appVersion = require("../package.json").version;

const getClientOptions = (session: Express.Session) => {
  const encounterId = session.encounterId || probablyUniqueString();
  const patreonLoginUrl =
    "http://www.patreon.com/oauth2/authorize" +
    `?response_type=code&client_id=${patreonClientId}` +
    `&redirect_uri=${baseUrl}/r/patreon` +
    `&scope=` +
    encodeURIComponent(`identity identity.memberships identity[email]`) +
    `&state=${encounterId}`;

  const environment: ClientEnvironment = {
    EncounterId: encounterId,
    BaseUrl: baseUrl,
    PatreonLoginUrl: patreonLoginUrl,
    IsLoggedIn: session.isLoggedIn || false,
    HasStorage: session.hasStorage || false,
    HasEpicInitiative: session.hasEpicInitiative || false,
    SendMetrics: process.env.METRICS_DB_CONNECTION_STRING != undefined,
    PostedEncounter: null,
    SentryDSN: process.env.SENTRY_DSN || null
  };

  if (session.postedEncounter) {
    environment.PostedEncounter = session.postedEncounter;
    delete session.postedEncounter;
  }

  return {
    environmentJSON: JSON.stringify(environment),
    baseUrl,
    appVersion,
    googleAnalyticsId,
    accountLevel: getAccountLevel(session)
  };
};

function getAccountLevel(session) {
  if (!session.isLoggedIn) {
    return "LoggedOut";
  }
  if (!session.hasStorage) {
    return "LoggedInFree";
  }
  if (!session.hasEpicInitiative) {
    return "AccountSync";
  }
  return "EpicInitiative";
}

export default function (
  app: express.Application,
  playerViews: PlayerViewManager
): void {
  const mustacheEngine = mustacheExpress();

  let cacheMaxAge = moment.duration(7, "days").asMilliseconds();
  if (process.env.NODE_ENV === "development") {
    mustacheEngine.cache._max = 0;
    cacheMaxAge = 0;
  }

  app.engine("html", mustacheEngine);
  app.set("view engine", "html");
  app.set("views", __dirname + "/../html");

  app.use(express.static(__dirname + "/../public", { maxAge: cacheMaxAge }));

  app.use(
    bodyParser.json({
      verify: function (req, res, buf, encoding) {
        req["rawBody"] = buf.toString();
      }
    })
  );
  app.use(bodyParser.urlencoded({ extended: false }));

  configureMetricsRoutes(app);

  app.get("/", async (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }

    session.encounterId = await playerViews.InitializeNew();

    const renderOptions = getClientOptions(session);
    return res.render("landing", renderOptions);
  });

  configureAffiliateRoutes(app);

  app.get("/e/:id", (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }
    session.encounterId = req.params.id;
    const urlObject = new URL(req.url, baseUrl);
    const queryString = urlObject.search;

    res.redirect("/e/" + queryString);
  });

  app.get("/e/", async (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }

    if (defaultAccountLevel !== "free") {
      await setupLocalDefaultUser(session);
    }

    updateSession(session);

    const options = getClientOptions(session);
    return res.render("tracker", options);
  });

  app.get("/p/:id", (req: Req, res: Res) => {
    const session = req.session;
    if (session == null) {
      throw "Session is not available";
    }

    session.encounterId = req.params.id;
    res.render("playerview", getClientOptions(session));
  });

  app.get("/playerviews/:id", async (req: Req, res: Res) => {
    const playerView = await playerViews.Get(req.params.id);
    res.json(playerView);
  });

  configureBasicRulesContent(app);
  configureOpen5eContent(app);

  configureImportRoutes(app, playerViews);
  app.get("/transferlocalstorage/", (req: Req, res: Res) => {
    res.render("transferlocalstorage", { baseUrl });
  });

  configureLoginRedirect(app);
  configureLogout(app);
  configurePatreonWebhookReceiver(app);
  configureStorageRoutes(app);
  startNewsUpdates(app);
}

async function setupLocalDefaultUser(session: Express.Session) {
  let accountStatus = AccountStatus.None;
  if (defaultAccountLevel === "accountsync") {
    session.hasStorage = true;
    accountStatus = AccountStatus.Pledge;
  }

  if (defaultAccountLevel === "epicinitiative") {
    session.hasStorage = true;
    session.hasEpicInitiative = true;
    accountStatus = AccountStatus.Epic;
  }

  session.isLoggedIn = true;

  const user = await upsertUser(
    process.env.DEFAULT_PATREON_ID || "defaultPatreonId",
    accountStatus,
    ""
  );

  if (user) {
    session.userId = user._id;
  }

  return;
}

async function updateSession(session: Express.Session) {
  if (session.userId) {
    const account = await getAccount(session.userId);
    if (account) {
      updateSessionAccountFeatures(session, account.accountStatus);
    }
  }
}
