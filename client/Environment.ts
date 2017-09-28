module ImprovedInitiative {
    interface Environment {
        EncounterId: string;
        PostedEncounter: { Combatants: any[] };
        HasStorage: boolean;
    }

    export const env: Environment = {
        EncounterId: null,
        PostedEncounter: null,
        HasStorage: null
    };

    export function LoadEnvironment() {
        env.EncounterId = $('html')[0].getAttribute('encounterId');
        const encounterJSON = $('html')[0].getAttribute('postedEncounter');
        if (encounterJSON) {
            env.PostedEncounter = JSON.parse(encounterJSON);
        }
        env.HasStorage = $('html')[0].getAttribute('hasStorage') == "true";
    };
}