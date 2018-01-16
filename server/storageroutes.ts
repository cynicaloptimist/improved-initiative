import request = require("request");
import express = require("express");

import { Library, StatBlock, Spell, LibraryItem } from "./library";
import * as DB from "./dbconnection";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;


const verifyStorage = (req: Req) => {
    return req.session && req.session.hasStorage;
};

function configureEntityRoute<T extends LibraryItem>(app: express.Application, route: DB.EntityPath) {
    app.get(`/my/${route}/:id`, (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.getEntity<T>(route, req.session.userId, req.params.id, entity => {
            if (entity) {
                return res.json(entity);    
            } else {
                return res.sendStatus(404);
            }
            
        }).catch(err => {
            return res.sendStatus(500);
        });
    });
    
    app.post(`/my/${route}/`, (req, res: Res) => {
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

    app.delete(`/my/${route}/:id`, (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
        
        return DB.deleteEntity<T>(route, req.session.userId, req.params.id, result => {
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
    
    configureEntityRoute(app, "statblocks");
    configureEntityRoute(app, "playercharacters");
    configureEntityRoute(app, "spells");
    configureEntityRoute(app, "encounters");
}
