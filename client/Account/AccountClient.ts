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

    $.getJSON("/my").done(callBack);

    return true;
  }

  public async DeleteAccount() {
    if (!env.HasStorage) {
      return emptyPromise();
    }

    return $.ajax({
      type: "DELETE",
      url: `/my`
    });
  }

  public async GetFullAccount() {
    if (!env.HasStorage) {
      return emptyPromise();
    }

    return await $.getJSON("/my/fullaccount");
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
        await prepareForSync(libraries.NPCs.GetStatBlocks()),
        "statblocks",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await prepareForSync(libraries.PersistentCharacters.GetListings()),
        "persistentcharacters",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await prepareForSync(libraries.Spells.GetSpells()),
        "spells",
        DEFAULT_BATCH_SIZE,
        messageCallback
      ),
      saveEntitySet(
        await prepareForSync(libraries.Encounters.Encounters()),
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
    if (path && path.length) {
      return this.SanitizeForId(path) + "-" + this.SanitizeForId(name);
    } else {
      return this.SanitizeForId(name);
    }
  }
}

function emptyPromise(): JQuery.jqXHR {
  const d: any = $.Deferred(); //TODO: anything but this.
  d.resolve(null);
  return d;
}

function saveEntity<T extends object>(entity: T, entityType: string) {
  if (!env.HasStorage) {
    return emptyPromise();
  }

  return $.ajax({
    type: "POST",
    url: `/my/${entityType}/`,
    data: JSON.stringify(entity),
    contentType: "application/json"
  });
}

export async function prepareForSync(items: Listing<Listable>[]) {
  const unsynced = await getUnsyncedItems(items);
  return sanitizeItems(unsynced);
}

async function getUnsyncedItems(items: Listing<Listable>[]) {
  const local = items.filter(
    i => i.Origin === "localStorage" || i.Origin === "localAsync"
  );

  const synced = items.filter(i => i.Origin === "account");
  const unsynced = local.filter(
    l => !synced.some(s => s.Listing().Name == l.Listing().Name)
  );

  const unsyncedItems = await Promise.all(
    unsynced.map(
      async listing =>
        await listing.GetWithTemplate({
          Id: listing.Listing().Id,
          Name: listing.Listing().Name,
          Path: listing.Listing().Path,
          Version: process.env.VERSION
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

  const uploadByBatch = (remaining: Listable[]) => {
    const batch = remaining.slice(0, batchSize);
    return $.ajax({
      type: "POST",
      url: `/my/${entityType}/`,
      data: JSON.stringify(batch),
      contentType: "application/json",
      error: (e, text) => messageCallback(text)
    }).then(r => {
      messageCallback(
        `Syncing, ${remaining.length} ${entityType} remaining...`
      );
      const next = remaining.slice(DEFAULT_BATCH_SIZE);
      if (!next.length) {
        return r;
      }
      return uploadByBatch(next);
    });
  };

  return uploadByBatch(entitySet);
}

function deleteEntity(entityId: string, entityType: string) {
  if (!env.HasStorage) {
    return emptyPromise();
  }

  return $.ajax({
    type: "DELETE",
    url: `/my/${entityType}/${entityId}`
  });
}
