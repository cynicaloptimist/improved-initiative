
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
            saveEntity<Settings>(settings, 'settings');
        }

        SaveStatBlock(statBlock: StatBlock) {
            saveEntity<StatBlock>(statBlock, 'statblocks');
        }

        DeleteStatBlock(statBlockId: string) {
            deleteEntity(statBlockId, 'statblocks');
        }

        SavePlayerCharacter(playerCharacter: StatBlock) {
            saveEntity<StatBlock>(playerCharacter, 'playercharacters');
        }

        DeletePlayerCharacter(statBlockId: string) {
            deleteEntity(statBlockId, 'playercharacters');
        }

        SaveEncounter(encounter: SavedEncounter<SavedCombatant>) {
            saveEntity<SavedEncounter<SavedCombatant>>(encounter, 'encounters');
        }

        DeleteEncounter(encounterId: string) {
            deleteEntity(encounterId, 'encounters');
        }

        SaveSpell(spell: Spell) {
            saveEntity<Spell>(spell, 'spells');
        }

        DeleteSpell(spellId: string) {
            deleteEntity(spellId, 'spells');
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
            dataType: "json",
            contentType: "application/json"
        }).then(s => console.log(`Saving ${entityType} entity: ${s}`));
    }

    function prepareForSync(items: Listing<Listable>[]) {
        const unsynced = getUnsyncedItems(items);
        return sanitizeItems(unsynced);
    }

    function getUnsyncedItems(items: Listing<Listable>[]) {
        const local = items.filter(i => i.Source === "localStorage");
        const synced = items.filter(i => i.Source === "account");
        const unsynced = local.filter(l => !synced.some(s => s.Name == l.Name));
        const unsyncedItems = unsynced.map(l => l.Value()).filter(v => v);
        return unsyncedItems;
    }

    function sanitizeItems(items: Listable[]) {
        return items.map(i => {
            if (!i.Id) {
                i.Id = probablyUniqueString();
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
            dataType: "json",
            contentType: "application/json",
            error: (e, text) => errorsCallback(text)
        }).then(s => console.log(`Saving ${entityType} entity: ${s}`));
    }

    function deleteEntity(entityId: string, entityType: string) {
        if (!env.HasStorage) {
            return null;
        }

        return $.ajax({
            type: "DELETE",
            url: `/my/${entityType}/${entityId}`,
        }).done(s => console.log(`Deleting ${entityType} entity: ${s}`));
    }
}