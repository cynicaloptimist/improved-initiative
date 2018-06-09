import { Listable } from "../../common/Listable";
import { SavedCombatant, SavedEncounter } from "../../common/SavedEncounter";
import { StatBlock } from "../../common/StatBlock";
import { env } from "../Environment";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { Settings } from "../Settings/Settings";
import { Spell } from "../Spell/Spell";

const BATCH_SIZE = 10;
export class AccountClient {
    public GetAccount(callBack: (user: any) => void) {
        if (!env.HasStorage) {
            return callBack(null);
        }

        $.getJSON("/my").done(callBack);

        return true;
    }

    public SaveAll(libraries: Libraries, messageCallback: (error: any) => void) {
        if (!env.HasStorage) {
            return emptyPromise();
        }

        $.when(
            saveEntitySet(prepareForSync(libraries.NPCs.StatBlocks()), "statblocks", messageCallback),
            saveEntitySet(prepareForSync(libraries.PCs.StatBlocks()), "playercharacters", messageCallback),
            saveEntitySet(prepareForSync(libraries.Spells.Spells()), "spells", messageCallback),
            saveEntitySet(prepareForSync(libraries.Encounters.Encounters()), "encounters", messageCallback)
        ).done(_ => {
            messageCallback("Account Sync complete.");
        });
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

    public SaveEncounter(encounter: SavedEncounter<SavedCombatant>) {
        return saveEntity<SavedEncounter<SavedCombatant>>(encounter, "encounters");
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

function prepareForSync(items: Listing<Listable>[]) {
    const unsynced = getUnsyncedItems(items);
    return sanitizeItems(unsynced);
}

function getUnsyncedItems(items: Listing<Listable>[]) {
    const local = items.filter(i => i.Origin === "localStorage");
    const synced = items.filter(i => i.Origin === "account");
    const unsynced = local.filter(l => !synced.some(s => s.Name == l.Name));
    const unsyncedItems = [];
    unsynced.forEach(l => l.GetAsyncWithUpdatedId(i => unsyncedItems.push(i)));
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

function saveEntitySet<Listable>(entitySet: Listable[], entityType: string, messageCallback: (message: string) => void) {
    if (!env.HasStorage || !entitySet.length) {
        return emptyPromise();
    }

    const uploadByBatch = (remaining: Listable[]) => {
        const batch = remaining.slice(0, BATCH_SIZE);
        return $.ajax({
            type: "POST",
            url: `/my/${entityType}/`,
            data: JSON.stringify(batch),
            contentType: "application/json",
            error: (e, text) => messageCallback(text)
        }).then(r => {
            messageCallback(`Syncing, ${remaining.length} ${entityType} remaining...`);
            const next = remaining.slice(BATCH_SIZE);
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
        url: `/my/${entityType}/${entityId}`,
    });
}
