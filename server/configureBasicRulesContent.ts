import express = require("express");
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { Library } from "./library";
import { Req, Res } from "./routes";

export function configureBasicRulesContent(app: express.Application) {
  const statBlockLibrary = Library.FromFile<StatBlock>(
    "ogl_creatures.json",
    "/statblocks/",
    StatBlock.GetSearchHint,
    StatBlock.FilterDimensions
  );

  app.get(statBlockLibrary.Route(), (req: Req, res: Res) => {
    res.json(statBlockLibrary.GetListings());
  });

  app.get(statBlockLibrary.Route() + ":id", (req: Req, res: Res) => {
    res.json(statBlockLibrary.GetById(req.params.id));
  });

  const spellLibrary = Library.FromFile<Spell>(
    "ogl_spells.json",
    "/spells/",
    Spell.GetSearchHint,
    Spell.GetFilterDimensions
  );

  app.get(spellLibrary.Route(), (req: Req, res: Res) => {
    res.json(spellLibrary.GetListings());
  });

  app.get(spellLibrary.Route() + ":id", (req: Req, res: Res) => {
    res.json(spellLibrary.GetById(req.params.id));
  });
}
