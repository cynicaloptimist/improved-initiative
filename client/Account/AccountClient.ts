
module ImprovedInitiative {
    export class AccountClient {
        GetAccount(callBack: (user: any) => void) {
            if (!env.HasStorage) {
                return false;
            }
            
            $.getJSON("/my").done(callBack);

            return true;
        }

        SaveAll(libraries: Libraries, errorsCallback: (error: any) => void) {
            if (!env.HasStorage) {
                return false;
            }
            
            saveEntitySet(prepareForSync(libraries.NPCs.StatBlocks()), "statblocks", errorsCallback);
            saveEntitySet(prepareForSync(libraries.PCs.StatBlocks()), "playercharacters", errorsCallback);
            saveEntitySet(prepareForSync(libraries.Spells.Spells()), "spells", errorsCallback);
            saveEntitySet(prepareForSync(libraries.Encounters.Encounters()), "encounters", errorsCallback);
        }

        SaveSettings(settings: Settings) {
            return saveEntity<Settings>(settings, 'settings');
        }

        SaveStatBlock(statBlock: StatBlock) {
            return saveEntity<StatBlock>(statBlock, 'statblocks');
        }

        DeleteStatBlock(statBlockId: string) {
            return deleteEntity(statBlockId, 'statblocks');
        }

        SavePlayerCharacter(playerCharacter: StatBlock) {
            return saveEntity<StatBlock>(playerCharacter, 'playercharacters');
        }

        DeletePlayerCharacter(statBlockId: string) {
            return deleteEntity(statBlockId, 'playercharacters');
        }

        SaveEncounter(encounter: SavedEncounter<SavedCombatant>) {
            return saveEntity<SavedEncounter<SavedCombatant>>(encounter, 'encounters');
        }

        DeleteEncounter(encounterId: string) {
            return deleteEntity(encounterId, 'encounters');
        }

        SaveSpell(spell: Spell) {
            return saveEntity<Spell>(spell, 'spells');
        }

        DeleteSpell(spellId: string) {
            return deleteEntity(spellId, 'spells');
        }

        static SanitizeForId(name: string) {
            return name.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, '');
        }
    }

    function saveEntity<T extends object>(entity: T, entityType: string) {
        if (!env.HasStorage) {
            return null;
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
        unsynced.forEach(l => l.GetAsync(i => unsyncedItems.push(i)));
        return unsyncedItems;
    }

    function sanitizeItems(items: Listable[]) {
        return items.map(i => {
            if (!i.Id) {
                i.Id = AccountClient.SanitizeForId(i.Name);
            } else {
                i.Id = i.Id.replace(".", "_");
            }
            
            if (!i.Version) {
                i.Version = "legacy";
            }

            return i;
        });
    }

    function saveEntitySet<Listable>(entitySet: Listable [], entityType: string, errorsCallback: (message: string) => void) {
        if (!env.HasStorage || !entitySet.length) {
            return null;
        }

        return $.ajax({
            type: "POST",
            url: `/my/${entityType}/`,
            data: JSON.stringify(entitySet),
            contentType: "application/json",
            error: (e, text) => errorsCallback(text)
        });
    }

    function deleteEntity(entityId: string, entityType: string) {
        if (!env.HasStorage) {
            return null;
        }

        return $.ajax({
            type: "DELETE",
            url: `/my/${entityType}/${entityId}`,
        });
    }
}