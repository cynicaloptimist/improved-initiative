import express = require("express");

import { CombatantState } from "../common/CombatantState";
import { EncounterState } from "../common/EncounterState";
import { Listable } from "../common/Listable";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const verifyStorage = (
  req: Express.Request
): req is { session: Express.Session } => {
  return req.session && req.session.hasStorage;
};

const parsePossiblyMalformedIdFromParams = params => {
  let id = params.id;
  for (let i = 0; params[i] !== undefined; i++) {
    id += params[i];
  }
  return id;
};

export default function(app: express.Application) {
  app.get("/my", (req: Req, res: Res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    return DB.getAccount(req.session.userId)
      .then(account => {
        return res.json(account);
      })
      .catch(err => {
        return res.sendStatus(500);
      });
  });

  app.get("/my/fullaccount", (req: Req, res: Res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    return DB.getFullAccount(req.session.userId)
      .then(account => {
        return res.json(account);
      })
      .catch(err => {
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
      return res
        .status(400)
        .send("Invalid settings object, requires Version number.");
    }
  });

  app.delete("/my", async (req, res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    const result = await DB.deleteAccount(req.session.userId);
    if (result) {
      return res.status(200);
    } else {
      return res.status(404);
    }
  });

  configureEntityRoute<PersistentCharacter>(app, "persistentcharacters");
  configureEntityRoute<StatBlock>(app, "statblocks");
  configureEntityRoute<Spell>(app, "spells");
  configureEntityRoute<EncounterState<CombatantState>>(app, "encounters");
}

function configureEntityRoute<T extends Listable>(
  app: express.Application,
  route: DB.EntityPath
) {
  app.get(`/my/${route}/:id*`, (req: Req, res: Res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    const session = req.session;
    if (session === undefined) {
      throw "Session is undefined.";
    }

    const entityId = parsePossiblyMalformedIdFromParams(req.params);

    return DB.getEntity(route, session.userId, entityId)
      .then(entity => {
        if (entity) {
          return res.json(entity);
        } else {
          return res.sendStatus(404);
        }
      })
      .catch(err => {
        return res.sendStatus(500);
      });
  });

  app.post(`/my/${route}/`, async (req: Req, res: Res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    if (req.body.Version) {
      try {
        await DB.saveEntity<T>(route, req.session.userId, req.body);
        return res.sendStatus(201);
      } catch (err) {
        return res.status(500).send(err);
      }
    } else if (req.body.length) {
      return DB.saveEntitySet<T>(
        route,
        req.session.userId,
        req.body,
        result => {
          return res.sendStatus(201);
        }
      ).catch(err => {
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
