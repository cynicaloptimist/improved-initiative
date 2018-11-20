import bodyParser = require("body-parser");
import dbSession = require("connect-mongodb-session");
import express = require("express");
import session = require("express-session");
import moment = require("moment");
import mustacheExpress = require("mustache-express");

import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import { upsertUser } from "./dbconnection";
import { Library } from "./library";
import { configureMetricsRoutes } from "./metrics";
import { configureLoginRedirect, configureLogout, startNewsUpdates } from "./patreon";
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
}

const pageRenderOptions = (session: Express.Session): IPageRenderOptions => ({
    rootDirectory: "../..",
    encounterId: session.encounterId || probablyUniqueString(),
    baseUrl,
    patreonClientId,
    isLoggedIn: session.isLoggedIn || false,
    hasStorage: session.hasStorage || false,
    hasEpicInitiative: session.hasEpicInitiative || false,
    postedEncounter: null,
});

export default function (app: express.Application, statBlockLibrary: Library<StatBlock>, spellLibrary: Library<Spell>, playerViews: PlayerViewManager) {
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
        store: store || undefined,
        secret: process.env.SESSION_SECRET || probablyUniqueString(),
        resave: false,
        saveUninitialized: false,
        cookie
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    configureMetricsRoutes(app);

    app.get("/", (req: Req, res: Res) => {
        const session = req.session;
        if (session === undefined) {
            throw "Session is not available";
        }

        session.encounterId = playerViews.InitializeNew();
        const renderOptions = pageRenderOptions(session);
        if (defaultAccountLevel !== "free") {

            if (defaultAccountLevel === "accountsync") {
                session.hasStorage = true;
            }

            if (defaultAccountLevel === "epicinitiative") {
                session.hasStorage = true;
                session.hasEpicInitiative = true;
            }

            session.isLoggedIn = true;

            if (process.env.DB_CONNECTION_STRING) {
                upsertUser("defaultPatreonId", "accesskey", "refreshkey", "pledge")
                    .then(result => {
                        if (result) {
                            session.userId = result._id;
                        }

                        res.render("landing", renderOptions);
                    });
            } else {
                session.userId = probablyUniqueString();
                res.render("landing", renderOptions);
            }
        } else {
            res.render("landing", renderOptions);
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

    app.get("/playerviews/:id", (req: Req, res: Res) => {
        res.json(playerViews.Get(req.params.id));
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

    const importEncounter = (req, res: Res) => {
        const newViewId = playerViews.InitializeNew();
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

    app.get("/transferlocalstorage/", (req: Req, res: Res) => {
        res.render("transferlocalstorage", { baseUrl });
    });

    configureLoginRedirect(app);
    configureLogout(app);
    configureStorageRoutes(app);
    startNewsUpdates(app);
}
