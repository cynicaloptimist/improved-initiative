import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";

export class LauncherViewModel {
    constructor() {
        Metrics.TrackEvent('LandingPageLoad');
    }

    GeneratedEncounterId = env.EncounterId;
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
