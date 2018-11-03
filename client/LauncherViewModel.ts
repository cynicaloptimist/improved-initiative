import * as ko from "knockout";

import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";
import { TransferLocalStorageToCanonicalURLIfNeeded } from "./Utility/TransferLocalStorage";

export class LauncherViewModel {
    constructor() {
        const pageLoadData = {
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
        Metrics.TrackEvent("LandingPageLoad", pageLoadData);

        TransferLocalStorageToCanonicalURLIfNeeded(env.CanonicalURL);
    }

    public GeneratedEncounterId = env.EncounterId;
    public JoinEncounterInput = ko.observable<string>("");

    public StartEncounter = () => {
        let encounterId = this.JoinEncounterInput().split("/").pop();
        window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
    }

    public JoinEncounter = () => {
        let encounterId = this.JoinEncounterInput().split("/").pop();
        if (encounterId) {
            window.location.href = `p/${encounterId}`;
        }
    }

    public JoinEncounterButtonClass = () => {
        let encounterId = this.JoinEncounterInput().split("/").pop();
        return encounterId ? "enabled" : "disabled";
    }
}
