import request = require("request");
import express = require("express");
import bodyParser = require("body-parser");
import mustacheExpress = require("mustache-express");
import session = require("express-session");
import dbSession = require('connect-mongodb-session');

import { Library, StatBlock, Spell } from "./library";
import { configureLogin, getNews } from "./patreon";

const pageRenderOptions = (encounterId: string) => ({
    rootDirectory: "../../",
    encounterId,
    appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "",
    baseUrl: process.env.BASE_URL || "",
    patreonClientId: process.env.PATREON_CLIENT_ID || "PATREON_CLIENT_ID",
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
        saveUninitialized: true,
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get("/", (req, res) => {
        res.render("landing", pageRenderOptions(initializeNewPlayerView(playerViews)));
    });

    app.get("/e/:id", (req, res) => {
        const session: any = req.session;
        const options = pageRenderOptions(req.params.id);
        if (session.postedEncounter) {
            options.postedEncounter = JSON.stringify(session.postedEncounter);
        }
        res.render("tracker", options);
    });

    app.get("/p/:id", (req, res) => {
        res.render("playerview", pageRenderOptions(req.params.id));
    });

    app.get("/playerviews/:id", (req, res) => {
        res.json(playerViews[req.params.id]);
    });

    app.get("/templates/:name", (req, res) => {
        res.render(`templates/${req.params.name}`, pageRenderOptions(""));
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

    const importEncounter = (req, res) => {
        const newViewId = initializeNewPlayerView(playerViews);
        const session: any = req.session;

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
