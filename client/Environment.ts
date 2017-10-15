module ImprovedInitiative {
    interface Environment {
        EncounterId: string;
        PostedEncounter: { Combatants: any[] };
        IsLoggedIn: boolean;
        HasStorage: boolean;
    }

    export const env: Environment = {
        EncounterId: null,
        PostedEncounter: null,
        HasStorage: false,
        IsLoggedIn: false
    };

    export function LoadEnvironment() {
        env.EncounterId = $('html')[0].getAttribute('encounterId');
        const encounterJSON = $('html')[0].getAttribute('postedEncounter');
        if (encounterJSON) {
            env.PostedEncounter = JSON.parse(encounterJSON);
        }
        env.HasStorage = $('html')[0].getAttribute('hasStorage') == "true";
        env.IsLoggedIn = $('html')[0].getAttribute('isLoggedIn') == "true";
    };
}