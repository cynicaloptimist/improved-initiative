import * as ko from "knockout";

import { Listable } from "../../common/Listable";
import { env } from "../Environment";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";

function getCounts<T extends Listable>(items: Listing<T>[]) {
  const localCount = items.filter(c => c.Origin === "localStorage").length;
  const accountCount = items.filter(c => c.Origin === "account").length;
  return `${localCount} local, ${accountCount} synced`;
}

export class AccountViewModel {
  constructor(public Libraries: Libraries) {}

  public IsLoggedIn = env.IsLoggedIn;
  public HasStorage = env.HasStorage;
  public HasEpicInitiative = env.HasEpicInitiative;
  public PatreonLoginUrl = env.PatreonLoginUrl;

  public SyncedCreatures = ko.computed(() =>
    getCounts(this.Libraries.NPCs.StatBlocks())
  );
  public SyncedCharacters = ko.computed(() =>
    getCounts(this.Libraries.PersistentCharacters.GetListings())
  );
  public SyncedSpells = ko.computed(() =>
    getCounts(this.Libraries.Spells.Spells())
  );
  public SyncedEncounters = ko.computed(() =>
    getCounts(this.Libraries.Encounters.Encounters())
  );
}
