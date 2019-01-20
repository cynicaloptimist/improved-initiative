import * as ko from "knockout";

import { ServerListing } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { EncounterLibrary } from "./EncounterLibrary";
import { Listing } from "./Listing";
import { NPCLibrary } from "./NPCLibrary";
import { PersistentCharacterLibrary } from "./PersistentCharacterLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
  public PersistentCharacters: PersistentCharacterLibrary;
  public NPCs: NPCLibrary;
  public Encounters: EncounterLibrary;
  public Spells: SpellLibrary;

  constructor(accountClient: AccountClient) {
    this.PersistentCharacters = new PersistentCharacterLibrary(accountClient);
    this.NPCs = new NPCLibrary(accountClient);
    this.Encounters = new EncounterLibrary(accountClient);
    this.Spells = new SpellLibrary(accountClient);

    this.initializeStatBlocks();
    this.initializeSpells();
  }

  private initializeStatBlocks = () => {
    $.ajax("../statblocks/").done(s => this.NPCs.AddListings(s, "server"));

    const localStatBlocks = Store.List(Store.StatBlocks);
    const listings = localStatBlocks.map(id => {
      const statBlock = {
        ...StatBlock.Default(),
        ...Store.Load<StatBlock>(Store.StatBlocks, id)
      };

      const listing: ServerListing = {
        Id: id,
        Name: statBlock.Name,
        Path: statBlock.Path,
        SearchHint: StatBlock.GetKeywords(statBlock),
        Link: Store.StatBlocks
      };

      return listing;
    });
    this.NPCs.AddListings(listings, "localStorage");
  };

  private initializeSpells = () => {
    $.ajax("../spells/").done(listings =>
      this.Spells.AddListings(listings, "server")
    );

    const localSpells = Store.List(Store.Spells);
    const newListings = localSpells.map(id => {
      const spell = {
        ...Spell.Default(),
        ...Store.Load<Spell>(Store.Spells, id)
      };
      const listing = {
        Id: id,
        Name: spell.Name,
        Path: spell.Path,
        SearchHint: Spell.GetKeywords(spell),
        Link: Store.Spells
      };

      return listing;
    });

    this.Spells.AddListings(newListings, "localStorage");
  };
}
