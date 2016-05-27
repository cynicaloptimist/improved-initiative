module ImprovedInitiative {
    export class LauncherViewModel {
        constructor() {
        }

        GeneratedEncounterId = $('html')[0].getAttribute('encounterId');
        JoinEncounterInput = ko.observable<string>();

        StartEncounter = () => {
            window.location.href = `e/${this.GeneratedEncounterId}`;
        }

        JoinEncounter = () => {
            var encounterId = this.JoinEncounterInput().split('/').pop();
            window.location.href = `p/${encounterId}`;
        }
    }
}