import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";

export class LauncherViewModel {
    constructor() {
        const pageLoadData = {
            referrer: document.referrer,
            userAgent: navigator.userAgent
        }
        Metrics.TrackEvent("LandingPageLoad", pageLoadData);
    }

    public GeneratedEncounterId = env.EncounterId;
    public JoinEncounterInput = ko.observable<string>("");

    public StartEncounter = () => {
        var encounterId = this.JoinEncounterInput().split("/").pop();
        window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
    }

    public JoinEncounter = () => {
        var encounterId = this.JoinEncounterInput().split("/").pop();
        if (encounterId) {
            window.location.href = `p/${encounterId}`;
        }
    }

    public JoinEncounterButtonClass = () => {
        var encounterId = this.JoinEncounterInput().split("/").pop();
        return encounterId ? "enabled" : "disabled";
    }
}
