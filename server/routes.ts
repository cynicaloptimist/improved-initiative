import bodyParser = require("body-parser");
import express = require("express");
import moment = require("moment");
import mustacheExpress = require("mustache-express");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { upsertUser } from "./dbconnection";
import { Library } from "./library";
import { configureMetricsRoutes } from "./metrics";
import {
  configureLoginRedirect,
  configureLogout,
  configurePatreonWebhookReceiver,
  startNewsUpdates
} from "./patreon";
import { PlayerViewManager } from "./playerviewmanager";
import configureStorageRoutes from "./storageroutes";

const baseUrl = process.env.BASE_URL || "";
const patreonClientId = process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID";
const defaultAccountLevel = process.env.DEFAULT_ACCOUNT_LEVEL || "free";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

interface IPageRenderOptions {
  rootDirectory: string;
  encounterId: string;
  baseUrl: string;
  patreonClientId: string;
  isLoggedIn: boolean;
  hasStorage: boolean;
  hasEpicInitiative: boolean;
  postedEncounter: string | null;
  appVersion: string;
}

const appVersion = require("../package.json").version;

const pageRenderOptions = (session: Express.Session): IPageRenderOptions => ({
  rootDirectory: "../..",
  encounterId: session.encounterId || probablyUniqueString(),
  baseUrl,
  patreonClientId,
  isLoggedIn: session.isLoggedIn || false,
  hasStorage: session.hasStorage || false,
  hasEpicInitiative: session.hasEpicInitiative || false,
  postedEncounter: null,
  appVersion: appVersion
});

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

    if (defaultAccountLevel !== "free") {
      return await setupLocalDefaultUser(session, res);
    } else {
      const renderOptions = pageRenderOptions(session);
      return res.render("landing", renderOptions);
    }
  });

  app.get("/e/:id", (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }
    session.encounterId = req.params.id;

    res.redirect("/e/");
  });

  app.get("/e/", (req: Req, res: Res) => {
    const session = req.session;
    if (session === undefined) {
      throw "Session is not available";
    }

    const options = pageRenderOptions(session);
    if (session.postedEncounter) {
      options.postedEncounter = JSON.stringify(session.postedEncounter);
      delete session.postedEncounter;
    }
    res.render("tracker", options);
  });

  app.get("/p/:id", (req: Req, res: Res) => {
    const session = req.session;
    if (session == null) {
      throw "Session is not available";
    }

    session.encounterId = req.params.id;
    res.render("playerview", pageRenderOptions(session));
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

    res.render(`templates/${req.params.name}`, pageRenderOptions(session));
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

async function setupLocalDefaultUser(session: Express.Session, res: Res) {
  if (defaultAccountLevel === "accountsync") {
    session.hasStorage = true;
  }

  if (defaultAccountLevel === "epicinitiative") {
    session.hasStorage = true;
    session.hasEpicInitiative = true;
  }

  session.isLoggedIn = true;

  const user = await upsertUser(
    process.env.DEFAULT_PATREON_ID || "defaultPatreonId",
    "pledge"
  );

  if (user) {
    session.userId = user._id;
  }

  return res.render("landing", pageRenderOptions(session));
}
