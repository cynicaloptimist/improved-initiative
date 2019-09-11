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
  public NPCs: StatBlockLibrary;
  public Encounters: EncounterLibrary;
  public Spells: SpellLibrary;

  constructor(accountClient: AccountClient) {
    this.PersistentCharacters = new PersistentCharacterLibrary(accountClient);
    this.NPCs = new StatBlockLibrary(accountClient);
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
      return this.NPCs.AddListings(listings, "server");
    });

    const localStatBlocks = await Store.List(Store.StatBlocks);
    const listings = await Promise.all(
      localStatBlocks.map(async id => {
        const savedStatBlock = await Store.Load<StatBlock>(
          Store.StatBlocks,
          id
        );
        const statBlock = {
          ...StatBlock.Default(),
          ...savedStatBlock
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
      })
    );
    this.NPCs.AddListings(listings, "localAsync");
    await accountClient.SaveAllUnsyncedItems(this, () => {});
  };

  private initializeSpells = () => {
    $.ajax("../spells/").done(listings => {
      if (!listings) {
        return;
      }
      return this.Spells.AddListings(listings, "server");
    });

    const localSpells = LegacySynchronousLocalStore.List(
      LegacySynchronousLocalStore.Spells
    );
    const newListings = localSpells.map(id => {
      const spell = {
        ...Spell.Default(),
        ...LegacySynchronousLocalStore.Load<Spell>(
          LegacySynchronousLocalStore.Spells,
          id
        )
      };
      const listing = {
        Id: id,
        Name: spell.Name,
        Path: spell.Path,
        SearchHint: Spell.GetSearchHint(spell),
        Metadata: Spell.GetMetadata(spell),
        Link: LegacySynchronousLocalStore.Spells
      };

      return listing;
    });

    this.Spells.AddListings(newListings, "localStorage");
  };
}
