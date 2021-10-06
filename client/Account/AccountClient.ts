import axios from "axios";
import _ = require("lodash");
import retry = require("retry");

import { Listable } from "../../common/Listable";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { SavedEncounter } from "../../common/SavedEncounter";
import { Settings } from "../../common/Settings";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { env } from "../Environment";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";

const DEFAULT_BATCH_SIZE = 10;
const ENCOUNTER_BATCH_SIZE = 1;

export class AccountClient {
  public GetAccount(callBack: (user: any) => void) {
    if (!env.HasStorage) {
      return callBack(null);
    }

    axios.get("/my").then(response => callBack(response.data));

    return true;
  }

  public async DeleteAccount() {
    if (!env.HasStorage) {
      return emptyPromise();
    }

    return axios.delete("/my");
  }

  public async GetFullAccount() {
    if (!env.HasStorage) {
      return emptyPromise();
    }

    return await axios.get("/my/fullaccount");
  }

  public async SaveAllUnsyncedItems(
    libraries: Libraries,
    messageCallback: (message: string) => void
  ) {
    if (!env.HasStorage) {
      return;
    }

    const promises = [
      saveEntitySet(
        await getUnsyncedItemsFromListings(
          libraries.StatBlocks.GetAllListings()
        ),
        "statblocks",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await getUnsyncedItemsFromListings(
          libraries.PersistentCharacters.GetAllListings()
        ),
        "persistentcharacters",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await getUnsyncedItemsFromListings(libraries.Spells.GetAllListings()),
        "spells",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await getUnsyncedItemsFromListings(
          libraries.Encounters.GetAllListings()
        ),
        "encounters",
        ENCOUNTER_BATCH_SIZE,
        messageCallback
      )
    ];

    await Promise.all(promises);

    return messageCallback("Account Sync complete.");
  }

  public SaveSettings(settings: Settings) {
    return saveEntity<Settings>(settings, "settings");
  }

  public SaveStatBlock(statBlock: StatBlock) {
    return saveEntity<StatBlock>(statBlock, "statblocks");
  }

  public DeleteStatBlock(statBlockId: string) {
    return deleteEntity(statBlockId, "statblocks");
  }

  public SavePlayerCharacter(playerCharacter: StatBlock) {
    return saveEntity<StatBlock>(playerCharacter, "playercharacters");
  }

  public DeletePlayerCharacter(statBlockId: string) {
    return deleteEntity(statBlockId, "playercharacters");
  }

  public SavePersistentCharacter(persistentCharacter: PersistentCharacter) {
    return saveEntity<PersistentCharacter>(
      persistentCharacter,
      "persistentcharacters"
    );
  }

  public DeletePersistentCharacter(persistentCharacterId: string) {
    return deleteEntity(persistentCharacterId, "persistentcharacters");
  }

  public SaveEncounter(encounter: SavedEncounter) {
    return saveEntity<SavedEncounter>(encounter, "encounters");
  }

  public DeleteEncounter(encounterId: string) {
    return deleteEntity(encounterId, "encounters");
  }

  public SaveSpell(spell: Spell) {
    return saveEntity<Spell>(spell, "spells");
  }

  public DeleteSpell(spellId: string) {
    return deleteEntity(spellId, "spells");
  }

  private static SanitizeForId(str: string) {
    return str.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  }

  public static MakeId(name: string, path?: string) {
    if (path?.length) {
      return this.SanitizeForId(path) + "-" + this.SanitizeForId(name);
    } else {
      return this.SanitizeForId(name);
    }
  }
}

function emptyPromise() {
  return Promise.resolve(null);
}

function saveEntity<T>(entity: T, entityType: string): Promise<T | null> {
  if (!env.HasStorage) {
    return Promise.resolve(null);
  }

  const saveOperation = retry.operation({ retries: 3 });

  return new Promise(resolve => {
    saveOperation.attempt(() => {
      axios
        .post(`/my/${entityType}/`, JSON.stringify(entity), {
          headers: { "content-type": "application/json" }
        })
        .then(() => resolve(entity))
        .catch(err => {
          if (saveOperation.retry(new Error(err))) {
            return;
          }
          console.warn(`Failed to save ${entityType}: ${err}`);
          resolve(null);
        });
    });
  });
}

export async function getUnsyncedItemsFromListings(items: Listing<Listable>[]) {
  const unsynced = await getUnsyncedItems(items);
  return sanitizeItems(unsynced);
}

async function getUnsyncedItems(items: Listing<Listable>[]) {
  const itemsByName: _.Dictionary<Listing<Listable>> = {};
  for (const item of items) {
    const name = [item.Meta().Path + item.Meta().Name].toString();
    if (itemsByName[name] == undefined) {
      itemsByName[name] = item;
    } else {
      if (item.Origin == "account") {
        itemsByName[name] = item;
      }
    }
  }

  const unsynced = _.values(itemsByName).filter(
    i => i.Origin == "localStorage" || i.Origin == "localAsync"
  );

  const unsyncedItems = await Promise.all(
    unsynced.map(
      async listing =>
        await listing.GetWithTemplate({
          Id: listing.Meta().Id,
          Name: listing.Meta().Name,
          Path: listing.Meta().Path,
          Version: process.env.VERSION || "unknown"
        })
    )
  );

  return unsyncedItems;
}

function sanitizeItems(items: Listable[]) {
  return items.map(i => {
    if (!i.Id) {
      i.Id = AccountClient.MakeId(i.Name);
    } else {
      i.Id = i.Id.replace(".", "_");
    }

    if (!i.Version) {
      i.Version = "legacy";
    }

    return i;
  });
}

async function saveEntitySet<Listable>(
  entitySet: Listable[],
  entityType: string,
  batchSize: number,
  messageCallback: (message: string) => void
) {
  if (!env.HasStorage || !entitySet.length) {
    return;
  }

  for (let cursor = 0; cursor < entitySet.length; cursor += batchSize) {
    const batch = entitySet.slice(cursor, cursor + batchSize);
    try {
      await axios.post(`/my/${entityType}/`, JSON.stringify(batch), {
        headers: { "content-type": "application/json" }
      });
      messageCallback(`Syncing ${cursor}/${entitySet.length} ${entityType}`);
    } catch (err) {
      messageCallback(err);
    }
  }
}

function deleteEntity(entityId: string, entityType: string) {
  if (!env.HasStorage) {
    return emptyPromise();
  }

  return axios.delete(`/my/${entityType}/${entityId}`);
}
