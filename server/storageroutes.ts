import request = require("request");
import express = require("express");

import { Library, StatBlock, Spell } from "./library";
import * as DB from "./dbconnection";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;


const verifyStorage = (req: Req) => {
    return req.session && req.session.hasStorage;
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
    })
    
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
    
    app.get("/my/statblocks/:id", (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.getEntity<StatBlock>("statblocks", req.session.userId, req.params.id, statBlock => {
            if (statBlock) {
                return res.json(statBlock);    
            } else {
                return res.sendStatus(404);
            }
            
        }).catch(err => {
            return res.sendStatus(500);
        });
    });
    
    app.post("/my/statblocks/", (req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.saveEntity("statblocks", req.session.userId, req.body, result => {
            return res.sendStatus(201);    
        }).catch(err => {
            return res.status(500).send(err);
        });
    });
    
    app.get("/my/playercharacters/:id", (req: Req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.getEntity<StatBlock>("playercharacters", req.session.userId, req.params.id, statBlock => {
            if (statBlock) {
                return res.json(statBlock);    
            } else {
                return res.sendStatus(404);
            }
            
        }).catch(err => {
            return res.sendStatus(500);
        });
    });
    
    app.post("/my/playercharacters/", (req, res: Res) => {
        if (!verifyStorage(req)) {
            return res.sendStatus(403);
        }
    
        return DB.saveEntity("playercharacters", req.session.userId, req.body, result => {
            return res.sendStatus(201);    
        }).catch(err => {
            return res.status(500).send(err);
        });
    });
}
