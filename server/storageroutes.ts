import express = require("express");

import { Listable } from "../common/Listable";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { SavedCombatant, SavedEncounter } from "../common/SavedEncounter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const dbAvailable = !!process.env.DB_CONNECTION_STRING;

const verifyStorage = (req: Express.Request): req is { session: Express.Session } => {
    return dbAvailable && req.session && req.session.hasStorage;
};

const parsePossiblyMalformedIdFromParams = (params) => {
    let id = params.id;
    for (let i = 0; params[i] !== undefined; i++) {
        id += params[i];
    }
    return id;
};

function configureEntityRoute<T extends Listable>(app: express.Application, route: DB.EntityPath) {
    app.get(`/my/${route}/:id*`, (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
        
        const session = req.session;
        if (session === undefined) {
            throw "Session is undefined.";
        }
    
        const entityId = parsePossiblyMalformedIdFromParams(req.params);
    
        return DB.getEntity(route, session.userId, entityId, entity => {

            if (entity) {
                return res.json(entity);    
            } else {
                return res.sendStatus(404);
            }
            
        }).catch(err => {
            return res.sendStatus(500);
        });
    });
    
    app.post(`/my/${route}/`, (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }

        if (req.body.Version) {
            return DB.saveEntity<T>(route, req.session.userId, req.body, result => {
                return res.sendStatus(201);    
            }).catch(err => {
                return res.status(500).send(err);
            });
        } else if (req.body.length) {
            return DB.saveEntitySet<T>(route, req.session.userId, req.body, result => {
                return res.sendStatus(201);    
            }).catch(err => {
                return res.status(500).send(err);
            });
        } else {
            return res.status(400).send("Missing Version");
        }
    });

    app.delete(`/my/${route}/:id*`, (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
        const entityId = parsePossiblyMalformedIdFromParams(req.params);
        
        return DB.deleteEntity(route, req.session.userId, entityId, result => {
            if (!result) {
                return res.sendStatus(404);    
            }
            
            return res.sendStatus(204);
        }).catch(err => {
            return res.status(500).send(err);
        });
    });
}

export default function(app: express.Application) {
    app.get("/my", (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.getAccount(req.session.userId, account => {
            return res.json(account);
        }).catch(err => {
            return res.sendStatus(500);
        });
    });
    
    app.post("/my/settings", (req, res: express.Response) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
        
        const newSettings = req.body;
    
        if (newSettings.Version) {
            return DB.setSettings(req.session.userId, newSettings).then(r => {
                return res.sendStatus(200);
            });
        } else {
            return res.status(400).send("Invalid settings object, requires Version number.");
        }
    });
    
    configureEntityRoute<PersistentCharacter>(app, "persistentcharacters");
    configureEntityRoute<StatBlock>(app, "statblocks");
    configureEntityRoute<StatBlock>(app, "playercharacters");
    configureEntityRoute<Spell>(app, "spells");
    configureEntityRoute<SavedEncounter<SavedCombatant>>(app, "encounters");
}
