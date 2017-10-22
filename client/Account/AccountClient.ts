
module ImprovedInitiative {
    function post(url: string, data: object) {
        return ;
    }

    function saveEntity<T extends object>(entity: T, entityType: string) {
        if (!env.HasStorage) {
            return false;
        }

        $.ajax({
            type: "POST",
            url: `/my/${entityType}/`,
            data: JSON.stringify(entity),
            dataType: "json",
            contentType: "application/json"
        }).then(s => console.log(`Saving ${entityType} entity: ${s}`));
        
        return true;
    }

    function deleteEntity(entityId: string, entityType: string) {
        if (!env.HasStorage) {
            return false;
        }

        $.ajax({
            type: "DELETE",
            url: `/my/${entityType}/${entityId}`,
        }).done(s => console.log(`Deleting ${entityType} entity: ${s}`));
        
        return true;
    }
    
    export class AccountClient {
        GetAccount(callBack: (user: any) => void) {
            if (!env.HasStorage) {
                return false;
            }
            
            $.getJSON("/my").done(callBack);

            return true;
        }

        SaveSettings(settings: Settings) {
            saveEntity<Settings>(settings, 'settings');
        }

        SaveStatBlock(statBlock: StatBlock) {
            saveEntity<StatBlock>(statBlock, 'statblocks');
        }

        DeleteStatBlock(statBlockId: string) {
            deleteEntity(statBlockId, 'statblocks')
        }
        SavePlayerCharacter(playerCharacter: StatBlock) {
            saveEntity<StatBlock>(playerCharacter, 'playercharacters');
        }

        DeletePlayerCharacter(statBlockId: string) {
            deleteEntity(statBlockId, 'playercharacters')
        }
    }
}