import request = require("request");
import express = require("express");
import bodyParser = require("body-parser");
import mustacheExpress = require("mustache-express");
import session = require("express-session");
import dbSession = require('connect-mongodb-session');

import { Library, StatBlock, Spell } from "./library";
import { configureLogin, getNews } from "./patreon";
import * as DB from "./dbconnection";

const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "";
const baseUrl = process.env.BASE_URL || "";
const patreonClientId = process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID";
const defaultAccountLevel = process.env.DEFAULT_ACCOUNT_LEVEL || "free";

const pageRenderOptions = (encounterId: string, session: Express.Session) => ({
    rootDirectory: "../../",
    encounterId,
    appInsightsKey,
    baseUrl,
    patreonClientId,
    hasStorage: session.hasStorage || false,
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
    
    if (process.env.DB_CONNECTION_STRING) {
        var store = new MongoDBStore(
        {
            uri: process.env.DB_CONNECTION_STRING,
            collection: 'sessions'
        });
    }
    
    if (process.env.NODE_ENV === "development") {
        mustacheEngine.cache._max = 0;
    }
    app.engine("html", mustacheEngine);
    app.set("view engine", "html");
    app.set("views", __dirname + "/../html");

    app.use(express.static(__dirname + "/../public"));
    app.use(session({
        store: store || null,
        secret: process.env.SESSION_SECRET || probablyUniqueString(),
        resave: false,
        saveUninitialized: false,
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get("/", (req: Express.Request, res) => {
        if (defaultAccountLevel === "accountsync") {
            req.session.patreonId = "default";
            req.session.hasStorage = true;
            DB.upsertUser(req.session.patreonId, "accesskey", "refreshkey", "pledge")
        }
        res.render("landing", pageRenderOptions(initializeNewPlayerView(playerViews), req.session));
    });

    app.get("/e/:id", (req, res) => {
        const session: any = req.session;
        const options = pageRenderOptions(req.params.id, req.session);
        if (session.postedEncounter) {
            options.postedEncounter = JSON.stringify(session.postedEncounter);
        }
        res.render("tracker", options);
    });

    app.get("/p/:id", (req, res) => {
        res.render("playerview", pageRenderOptions(req.params.id, req.session));
    });

    app.get("/playerviews/:id", (req, res) => {
        res.json(playerViews[req.params.id]);
    });

    app.get("/templates/:name", (req, res) => {
        res.render(`templates/${req.params.name}`, pageRenderOptions("", req.session));
    });

    app.get(statBlockLibrary.Route(), (req, res) => {
        res.json(statBlockLibrary.GetListings());
    });

    app.get(statBlockLibrary.Route() + ":id", (req, res) => {
        res.json(statBlockLibrary.GetById(req.params.id));
    });

    app.get(spellLibrary.Route(), (req, res) => {
        res.json(spellLibrary.GetListings());
    });

    app.get(spellLibrary.Route() + ":id", (req, res) => {
        res.json(spellLibrary.GetById(req.params.id));
    });

    app.get("/my/settings", (req, res) => {
        if (!req.session.patreonId) {
            res.sendStatus(403);
            return;
        }

        DB.getSettings(req.session.patreonId, settings => {
            res.json(settings);
        });
    });

    app.post("/my/settings", (req, res: express.Response) => {
        if (!req.session.patreonId) {
            res.sendStatus(403);
            return;
        }

        const newSettings = req.body;

        if (newSettings.Version) {
            DB.setSettings(req.session.patreonId, newSettings, (a, b) => {
                res.sendStatus(200)
            });
        }
    });

    const importEncounter = (req, res) => {
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

    configureLogin(app);
    getNews(app);
}
