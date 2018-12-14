import * as ko from "knockout";

import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";
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
        const encounterId = this.JoinEncounterInput().split("/").pop();
        Store.Delete(Store.AutoSavedEncounters, Store.DefaultSavedEncounterId);
        window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
    }

    public JoinEncounter = () => {
        const encounterId = this.JoinEncounterInput().split("/").pop();
        Store.Delete(Store.AutoSavedEncounters, Store.DefaultSavedEncounterId);
        if (encounterId) {
            window.location.href = `p/${encounterId}`;
        }
    }

    public JoinEncounterButtonClass = () => {
        const encounterId = this.JoinEncounterInput().split("/").pop();
        return encounterId ? "enabled" : "disabled";
    }
}
