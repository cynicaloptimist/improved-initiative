export class LauncherViewModel {
    constructor() {
    }

    GeneratedEncounterId = $('html')[0].getAttribute('encounterId');
    JoinEncounterInput = ko.observable<string>('');

    StartEncounter = () => {
        var encounterId = this.JoinEncounterInput().split('/').pop();
        window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
    }

    JoinEncounter = () => {
        var encounterId = this.JoinEncounterInput().split('/').pop();
        if (encounterId) {
            window.location.href = `p/${encounterId}`;
        }
    }

    JoinEncounterButtonClass = () => {
        var encounterId = this.JoinEncounterInput().split('/').pop();
        return encounterId ? 'enabled' : 'disabled';
    }
}
