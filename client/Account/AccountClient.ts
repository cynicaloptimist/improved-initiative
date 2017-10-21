
module ImprovedInitiative {
    function post(url: string, data: object) {
        return ;
    }

    function saveEntity<T extends object>(entity: T, route: string) {
        if (!env.HasStorage) {
            return false;
        }

        $.ajax({
            type: "POST",
            url: route,
            data: JSON.stringify(entity),
            dataType: "json",
            contentType: "application/json"
        }).then(s => console.log(`Saving ${route} entity: ${s}`));
        
        return true;
    }

    function deleteEntity(entityId: string, route: string) {
        if (!env.HasStorage) {
            return false;
        }

        $.ajax({
            type: "DELETE",
            url: `/my/${route}/${entityId}`,
        }).done(s => console.log(`Deleting ${route} entity: ${s}`));
        
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
            saveEntity<Settings>(settings, '/my/settings');
        }

        SaveStatBlock(statBlock: StatBlock) {
            saveEntity<StatBlock>(statBlock, '/my/statblocks');
        }

        DeleteStatBlock(statBlockId: string) {
            deleteEntity(statBlockId, '/my/statblocks')
        }
        SavePlayerCharacter(playerCharacter: StatBlock) {
            saveEntity<StatBlock>(playerCharacter, '/my/playercharacters');
        }

        DeletePlayerCharacter(statBlockId: string) {
            deleteEntity(statBlockId, '/my/playercharacters')
        }
    }
}