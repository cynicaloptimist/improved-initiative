import express = require("express");

import { Listable } from "../common/Listable";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as DB from "./dbconnection";
import { SavedEncounter } from "./library";
import { updateSessionAccountFeatures } from "./patreon";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const verifyStorage = (
  req: Express.Request
): req is { session: Express.Session } => {
  return req.session?.hasStorage;
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
        if (!account) {
          return res.sendStatus(404);
        }
        if (req.session && account.accountStatus) {
          updateSessionAccountFeatures(req.session, account.accountStatus);
        }
        return res.json(account);
      })
      .catch(err => {
        console.error(err);
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
        console.error(err);
        return res.sendStatus(500);
      });
  });

  app.post("/my/settings", (req, res: express.Response) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    const newSettings = req.body;

    if (newSettings.Version) {
      return DB.setSettings(req.session.userId, newSettings).then(() => {
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
  configureEntityRoute<SavedEncounter>(app, "encounters");
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
        console.error(err);
        return res.sendStatus(500);
      });
  });

  app.post(`/my/${route}/`, async (req: Req, res: Res) => {
    if (!verifyStorage(req)) {
      return res.sendStatus(403);
    }

    try {
      if (req.body.Version) {
        await DB.saveEntity<T>(route, req.session.userId, req.body);
        return res.sendStatus(201);
      } else if (req.body.length) {
        const saved = await DB.saveEntitySet<T>(
          route,
          req.session.userId,
          req.body
        );
        if (saved) {
          return res.sendStatus(201);
        } else {
          console.error("Could not save items for user: " + req.session.userId);
          console.log("post body was: " + JSON.stringify(req.body));
          return res.sendStatus(500).send();
        }
      } else {
        return res.status(400).send("Missing Version");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
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
      console.error(err);
      return res.status(500).send(err);
    });
  });
}
