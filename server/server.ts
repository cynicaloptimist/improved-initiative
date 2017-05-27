import * as socketIO from "socket.io";
import * as express from "express";

import ConfigureAppInsights from "./configureappinsights";
import LaunchServer from "./launchserver";
import ConfigureRoutes from "./routes";
import ConfigureSockets from "./sockets";
import * as L from "./library";

ConfigureAppInsights();

const app = express();
const http = require("http").Server(app);

const statBlockLibrary = L.Library.FromFile<L.StatBlock>("ogl_creatures.json", "/statblocks/", L.GetStatBlockKeywords);
const spellLibrary = L.Library.FromFile<L.Spell>("ogl_spells.json", "/spells/", L.GetSpellKeywords);
const playerViews = [];
ConfigureRoutes(app, statBlockLibrary, spellLibrary, playerViews);

const io = socketIO(http);
ConfigureSockets(io, playerViews);

LaunchServer(http);