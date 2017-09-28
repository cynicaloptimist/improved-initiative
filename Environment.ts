module ImprovedInitiative {
    export const env = {
        EncounterId: null,
        PostedEncounter: null,
        HasStorage: null
    };

    export function LoadEnvironment() {
        env.EncounterId = $('html')[0].getAttribute('encounterId');
        env.PostedEncounter = $('html')[0].getAttribute('postedEncounter');
        env.HasStorage = $('html')[0].getAttribute('hasStorage');
    };
}