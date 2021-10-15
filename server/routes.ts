import bodyParser = require("body-parser");
import express = require("express");
import moment = require("moment");
import mustacheExpress = require("mustache-express");

import { ClientEnvironment } from "../common/ClientEnvironment";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { getAccount, upsertUser } from "./dbconnection";
import { Library } from "./library";
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

const baseUrl = process.env.BASE_URL || "";
const patreonClientId = process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID";
const defaultAccountLevel = process.env.DEFAULT_ACCOUNT_LEVEL || "free";
const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID || "";
const twitterPixelId = process.env.TWITTER_PIXEL_ID || "";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const appVersion = require("../package.json").version;

const getClientOptions = (session: Express.Session) => {
  const encounterId = session.encounterId || probablyUniqueString();
  const patreonLoginUrl =
    "http://www.patreon.com/oauth2/authorize" +
    `?response_type=code&client_id=${patreonClientId}` +
    `&redirect_uri=${baseUrl}/r/patreon` +
    `&scope=users pledges-to-me` +
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
    twitterPixelId,
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

export default function(
  app: express.Application,
  statBlockLibrary: Library<StatBlock>,
  spellLibrary: Library<Spell>,
  playerViews: PlayerViewManager
) {
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
      verify: function(req, res, buf, encoding) {
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

  app.get("/e/:id", (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }
    session.encounterId = req.params.id;

    res.redirect("/e/");
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

  app.get("/templates/:name", (req: Req, res: Res) => {
    const session = req.session;
    if (session == null) {
      throw "Session is not available";
    }

    res.render(`templates/${req.params.name}`, getClientOptions(session));
  });

  app.get(statBlockLibrary.Route(), (req: Req, res: Res) => {
    res.json(statBlockLibrary.GetListings());
  });

  app.get(statBlockLibrary.Route() + ":id", (req: Req, res: Res) => {
    res.json(statBlockLibrary.GetById(req.params.id));
  });

  app.get(spellLibrary.Route(), (req: Req, res: Res) => {
    res.json(spellLibrary.GetListings());
  });

  app.get(spellLibrary.Route() + ":id", (req: Req, res: Res) => {
    res.json(spellLibrary.GetById(req.params.id));
  });

  const importEncounter = async (req, res: Res) => {
    const newViewId = await playerViews.InitializeNew();
    const session = req.session;

    if (typeof req.body.Combatants === "string") {
      session.postedEncounter = {
        Combatants: ParseJSONOrDefault(req.body.Combatants, [])
      };
    } else {
      session.postedEncounter = req.body;
    }

    res.redirect("/e/" + newViewId);
  };

  app.post("/launchencounter/", importEncounter);
  app.post("/importencounter/", importEncounter);

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
