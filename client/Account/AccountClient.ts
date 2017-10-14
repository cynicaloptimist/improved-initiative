module ImprovedInitiative {
    export class AccountClient {
        SaveSettings(settings: Settings) {
            if (env.HasStorage) {
                $.ajax(
                    '/my/settings',
                    {
                        data: JSON.stringify(settings),
                        contentType: 'application/json',
                        type: 'POST'
                    }
                ).done(s => console.log(`Saving settings: ${s}`));
            }
        }

        GetSettings(callBack: (s: Settings) => void) {
            if (env.HasStorage) {
                return $.getJSON('/my/settings', callBack);
            }
        }

        SaveCreature(statBlock: StatBlock) {
            if (env.HasStorage) {
                $.ajax(
                    '/my/creatures',
                    {
                        data: JSON.stringify(statBlock),
                        contentType: 'application/json',
                        type: 'POST'
                    }
                ).done(s => console.log(`Saving creature: ${s}`));
            }
        }
    }
}