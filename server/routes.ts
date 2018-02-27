import bodyParser = require("body-parser");
import dbSession = require("connect-mongodb-session");
import express = require("express");
import session = require("express-session");
import moment = require("moment");
import mustacheExpress = require("mustache-express");
import request = require("request");

import { Spell } from "../client/Spell/Spell";
import { StatBlock } from "../client/StatBlock/StatBlock";
import { upsertUser } from "./dbconnection";
import { Library } from "./library";
import configureMetricsRoutes from "./metrics";
import { configureLoginRedirect, configureLogout, startNewsUpdates } from "./patreon";
import configureStorageRoutes from "./storageroutes";

const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "";
const baseUrl = process.env.BASE_URL || "";
const patreonClientId = process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID";
const defaultAccountLevel = process.env.DEFAULT_ACCOUNT_LEVEL || "free";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const pageRenderOptions = (encounterId: string, session: Express.Session) => ({
    rootDirectory: "../../",
    encounterId,
    appInsightsKey,
    baseUrl,
    patreonClientId,
    isLoggedIn: session.isLoggedIn || false,
    hasStorage: session.hasStorage || false,
    hasEpicInitiative: session.hasEpicInitiative || false,
    postedEncounter: null,
});

const probablyUniqueString = (): string => {
    const chars = "1234567890abcdefghijkmnpqrstuvxyz";
    let str = "";
    for (let i = 0; i < 8; i++) {
        const index = Math.floor(Math.random() * chars.length);
        str += chars[index];
    }

    return str;
};

const initializeNewPlayerView = (playerViews) => {
    const encounterId = probablyUniqueString();
    playerViews[encounterId] = {};
    return encounterId;
};


export default function (app: express.Application, statBlockLibrary: Library<StatBlock>, spellLibrary: Library<Spell>, playerViews) {
    const mustacheEngine = mustacheExpress();
    const MongoDBStore = dbSession(session);
    let store = null;
    
    if (process.env.DB_CONNECTION_STRING) {
        store = new MongoDBStore(
            {
                uri: process.env.DB_CONNECTION_STRING,
                collection: "sessions"
            });
    }

    if (process.env.NODE_ENV === "development") {
        mustacheEngine.cache._max = 0;
    }

    app.engine("html", mustacheEngine);
    app.set("view engine", "html");
    app.set("views", __dirname + "/../html");

    app.use(express.static(__dirname + "/../public"));

    const cookie = {
        maxAge: moment.duration(1, "weeks").asMilliseconds(),
    };

    app.use(session({
        store: store || null,
        secret: process.env.SESSION_SECRET || probablyUniqueString(),
        resave: false,
        saveUninitialized: false,
        cookie
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get("/", (req: Req, res: Res) => {
        const renderOptions = pageRenderOptions(initializeNewPlayerView(playerViews), req.session);
        if (defaultAccountLevel !== "free") {

            if (defaultAccountLevel === "accountsync") {
                req.session.hasStorage = true;
            }

            if (defaultAccountLevel === "epicinitiative") {
                req.session.hasStorage = true;
                req.session.hasEpicInitiative = true;
            }

            req.session.isLoggedIn = true;

            if (process.env.DB_CONNECTION_STRING) {
                upsertUser("defaultPatreonId", "accesskey", "refreshkey", "pledge")
                .then(result => {
                    req.session.userId = result._id;
                    res.render("landing", renderOptions);
                });
            } else {
                req.session.userId = probablyUniqueString();
                res.render("landing", renderOptions);
            }
        } else {
            res.render("landing", renderOptions);
        }
    });

    app.get("/e/:id", (req: Req, res: Res) => {
        const session: any = req.session;
        const options = pageRenderOptions(req.params.id, req.session);
        if (session.postedEncounter) {
            options.postedEncounter = JSON.stringify(session.postedEncounter);
        }
        res.render("tracker", options);
    });

    app.get("/p/:id", (req: Req, res: Res) => {
        res.render("playerview", pageRenderOptions(req.params.id, req.session));
    });

    app.get("/playerviews/:id", (req: Req, res: Res) => {
        res.json(playerViews[req.params.id]);
    });

    app.get("/templates/:name", (req: Req, res: Res) => {
        res.render(`templates/${req.params.name}`, pageRenderOptions("", req.session));
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

    const importEncounter = (req, res: Res) => {
        const newViewId = initializeNewPlayerView(playerViews);
        const session = req.session;

        if (typeof req.body.Combatants === "string") {
            session.postedEncounter = { Combatants: JSON.parse(req.body.Combatants) };
        } else {
            session.postedEncounter = req.body;
        }

        res.redirect("/e/" + newViewId);
    };

    app.post("/launchencounter/", importEncounter);
    app.post("/importencounter/", importEncounter);

    configureLoginRedirect(app);
    configureLogout(app);
    configureStorageRoutes(app);
    configureMetricsRoutes(app);
    startNewsUpdates(app);
}
