import { ListingMeta } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { EncounterLibrary } from "./EncounterLibrary";
import { PersistentCharacterLibrary } from "./PersistentCharacterLibrary";
import { SpellLibrary } from "./SpellLibrary";
import { Library, StatBlockLibrary } from "./StatBlockLibrary";

export interface Libraries {
  PersistentCharacters: PersistentCharacterLibrary;
  StatBlocks: Library<StatBlock>;
  Encounters: EncounterLibrary;
  Spells: SpellLibrary;
}

export class AccountBackedLibraries {
  public PersistentCharacters: PersistentCharacterLibrary;
  public StatBlocks: Library<StatBlock>;
  public Encounters: EncounterLibrary;
  public Spells: SpellLibrary;

  constructor(accountClient: AccountClient) {
    this.PersistentCharacters = new PersistentCharacterLibrary(accountClient);
    this.StatBlocks = new Library<StatBlock>(Store.StatBlocks, {
      accountSave: accountClient.SaveStatBlock,
      accountDelete: accountClient.DeleteStatBlock,
      getFilterDimensions: StatBlock.FilterDimensions,
      getSearchHint: StatBlock.GetSearchHint
    });
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

      const listing: ListingMeta = {
        Id: statBlock.Id,
        Name: statBlock.Name,
        Path: statBlock.Path,
        SearchHint: StatBlock.GetSearchHint(statBlock),
        FilterDimensions: StatBlock.FilterDimensions(statBlock),
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
      const listing: ListingMeta = {
        Id: savedSpell.Id,
        Name: spell.Name,
        Path: spell.Path,
        SearchHint: Spell.GetSearchHint(spell),
        FilterDimensions: Spell.GetFilterDimensions(spell),
        Link: Store.Spells,
        LastUpdateMs: spell.LastUpdateMs || 0
      };

      return listing;
    });

    this.Spells.AddListings(newListings, "localAsync");
  };
}
