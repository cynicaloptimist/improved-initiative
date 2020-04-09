import { StoredListing } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Store } from "../Utility/Store";
import { EncounterLibrary } from "./EncounterLibrary";
import { PersistentCharacterLibrary } from "./PersistentCharacterLibrary";
import { SpellLibrary } from "./SpellLibrary";
import { StatBlockLibrary } from "./StatBlockLibrary";

export class Libraries {
  public PersistentCharacters: PersistentCharacterLibrary;
  public StatBlocks: StatBlockLibrary;
  public Encounters: EncounterLibrary;
  public Spells: SpellLibrary;

  constructor(accountClient: AccountClient) {
    this.PersistentCharacters = new PersistentCharacterLibrary(accountClient);
    this.StatBlocks = new StatBlockLibrary(accountClient);
    this.Encounters = new EncounterLibrary(accountClient);
    this.Spells = new SpellLibrary(accountClient);

    this.initializeStatBlocks(accountClient);
    this.initializeSpells();
  }

  private initializeStatBlocks = async (accountClient: AccountClient) => {
    $.ajax("../statblocks/").done(listings => {
      if (!listings) {
        return;
      }
      return this.StatBlocks.AddListings(listings, "server");
    });

    const localStatBlocks = await Store.LoadAllAndUpdateIds(Store.StatBlocks);
    const listings = localStatBlocks.map(savedStatBlock => {
      const statBlock = {
        ...StatBlock.Default(),
        ...savedStatBlock
      };

      const listing: StoredListing = {
        Id: statBlock.Id,
        Name: statBlock.Name,
        Path: statBlock.Path,
        SearchHint: StatBlock.GetSearchHint(statBlock),
        Metadata: StatBlock.GetMetadata(statBlock),
        Link: Store.StatBlocks,
        LastUpdateMs: statBlock.LastUpdateMs || 0
      };

      return listing;
    });
    this.StatBlocks.AddListings(listings, "localAsync");
    await accountClient.SaveAllUnsyncedItems(this, () => {});
  };

  private initializeSpells = async () => {
    $.ajax("../spells/").done(listings => {
      if (!listings) {
        return;
      }
      return this.Spells.AddListings(listings, "server");
    });

    const localSpells = await Store.LoadAllAndUpdateIds(Store.Spells);
    const newListings = localSpells.map(savedSpell => {
      const spell = {
        ...Spell.Default(),
        ...savedSpell
      };
      const listing = {
        Id: savedSpell.Id,
        Name: spell.Name,
        Path: spell.Path,
        SearchHint: Spell.GetSearchHint(spell),
        Metadata: Spell.GetMetadata(spell),
        Link: Store.Spells,
        LastUpdateMs: spell.LastUpdateMs || 0
      };

      return listing;
    });

    this.Spells.AddListings(newListings, "localAsync");
  };
}
