import * as express from "express";
import { ParseJSONOrDefault } from "../common/Toolbox";
import { Res, Req } from "./routes";
import request = require("request");
import { PlayerViewManager } from "./playerviewmanager";

export function configureImportRoutes(
  app: express.Application,
  playerViews: PlayerViewManager
) {
  const importEncounter = async (req, res: Res) => {
    const newViewId = await playerViews.InitializeNew();
    const session = req.session;

    if (typeof req.body.Combatants === "string") {
      session.postedEncounter = {
        Combatants: ParseJSONOrDefault(req.body.Combatants, [])
      };
    } else {
      session.postedEncounter = req.body;
    }

    res.redirect("/e/" + newViewId);
  };

  app.post("/launchencounter/", importEncounter);
  app.post("/importencounter/", importEncounter);

  app.get("/encounterfrom/", async (req: Req, res: Res) => {
    const session = req.session!;
    if (typeof req.query.url !== "string") {
      return res.status(400).send("Missing url parameter.");
    }
    request.get(req.query.url, async (error, _, body) => {
      if (error) {
        return res.status(400).send("Error fetching URL: " + error);
      }
      if (body.length > 1000000) {
        return res.status(400).send("Encounter JSON too large.");
      }
      try {
        const json = JSON.parse(body);
        if (typeof json.Combatants === "object" && json.Combatants.length > 0) {
          session.postedEncounter = {
            Combatants: json.Combatants
          };
          const newEncounterViewId = await playerViews.InitializeNew();
          res.redirect("/e/" + newEncounterViewId);
        } else {
          return res.status(400).send("Invalid JSON: Missing Combatants.");
        }
      } catch (e) {
        return res.status(400).send("Invalid JSON; could not parse: " + e);
      }
    });
  });

  app.get("/sampleencounter/", async (req: Req, res: Res) => {
    return res.send({
      Combatants: [
        { Name: "Nemo", HP: { Value: 10 } },
        { Name: "Fat Goblin", HP: { Value: 20 }, Id: "mm.goblin" },
        { Id: "mm.goblin" }
      ]
    });
  });
}
