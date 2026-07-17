import * as express from "express";
import { ParseJSONOrDefault } from "../common/Toolbox";
import { Res, Req } from "./routes";
import { fetchRemoteText } from "./fetchRemoteText";
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
    try {
      const body = await fetchRemoteText(req.query.url);
      if (body.length > 1000000) {
        return res.status(400).send("Encounter JSON too large.");
      }
      let json;
      try {
        json = JSON.parse(body);
      } catch (error) {
        return res
          .status(400)
          .send("Invalid JSON; could not parse: " + error);
      }
      if (typeof json.Combatants === "object" && json.Combatants.length > 0) {
        session.postedEncounter = {
          Combatants: json.Combatants
        };
        const newEncounterViewId = await playerViews.InitializeNew();
        return res.redirect("/e/" + newEncounterViewId);
      } else {
        return res.status(400).send("Invalid JSON: Missing Combatants.");
      }
    } catch (error) {
      console.warn("Unable to import encounter URL:", error);
      return res.status(400).send("Unable to fetch encounter URL.");
    }
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
