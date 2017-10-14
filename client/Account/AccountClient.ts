
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
        SaveSettings(settings: Settings) {
            if (!env.HasStorage) {
                return false;
            }

            post('/my/settings', settings)
                .done(s => console.log(`Saving settings: ${s}`));
            
            return true;
        }

        GetSettings(callBack: (s: Settings) => void) {
            if (!env.HasStorage) {
                return false;
            }

            $.getJSON('/my/settings', callBack);

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

        GetStatBlocks(callBack: (s: StatBlockListingStatic[]) => void) {
            if (!env.HasStorage) {
                return false;
            }

            $.getJSON('/my/statblocks', callBack);

            return true;
        }
    }
}