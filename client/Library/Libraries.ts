import { StoredListing } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { EncounterLibrary } from "./EncounterLibrary";
import { PersistentCharacterLibrary } from "./PersistentCharacterLibrary";
import { SpellLibrary } from "./SpellLibrary";
import { StatBlockLibrary } from "./StatBlockLibrary";

export class Libraries {
  public PersistentCharacters: PersistentCharacterLibrary;
  public NPCs: StatBlockLibrary;
  public Encounters: EncounterLibrary;
  public Spells: SpellLibrary;

  constructor(accountClient: AccountClient) {
    this.PersistentCharacters = new PersistentCharacterLibrary(accountClient);
    this.NPCs = new StatBlockLibrary(accountClient);
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

      const listing: StoredListing = {
        Id: id,
        Name: statBlock.Name,
        Path: statBlock.Path,
        SearchHint: StatBlock.GetSearchHint(statBlock),
        Metadata: StatBlock.GetMetadata(statBlock),
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
        SearchHint: Spell.GetSearchHint(spell),
        Metadata: Spell.GetMetadata(spell),
        Link: Store.Spells
      };

      return listing;
    });

    this.Spells.AddListings(newListings, "localStorage");
  };
}
