
module ImprovedInitiative {
    function post(url: string, data: object) {
        return $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json"
        });
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
            if (!env.HasStorage) {
                return false;
            }

            post('/my/settings', settings)
                .done(s => console.log(`Saving settings: ${s}`));
            
            return true;
        }

        SaveStatBlock(statBlock: StatBlock) {
            if (!env.HasStorage) {
                return false;
            }

            post('/my/statblocks', statBlock)
                .done(s => console.log(`Saving statblocks: ${s}`));
            
            return true;
        }
    }
}