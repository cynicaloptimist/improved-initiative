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
            if (env.HasStorage) {
                post('/my/settings', settings)
                    .done(s => console.log(`Saving settings: ${s}`));
            }
        }

        GetSettings(callBack: (s: Settings) => void) {
            if (env.HasStorage) {
                $.getJSON('/my/settings', callBack);
            }
        }

        SaveStatBlock(statBlock: StatBlock) {
            if (env.HasStorage) {
                post('/my/creatures', statBlock)
                    .done(s => console.log(`Saving creature: ${s}`));
            }
        }

        GetStatBlocks(callBack: (s: StatBlock[]) => void) {
            if (env.HasStorage) {
                $.getJSON('/my/creatures', callBack);
            }
        }

        GetStatBlock(callBack: (s: StatBlock) => void) {
            if (env.HasStorage) {
                $.getJSON('/my/creatures', callBack);
            }
        }
    }
}