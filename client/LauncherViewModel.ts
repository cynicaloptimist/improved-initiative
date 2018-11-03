import * as ko from "knockout";

import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";

export class LauncherViewModel {
    constructor() {
        const pageLoadData = {
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
        Metrics.TrackEvent("LandingPageLoad", pageLoadData);

        const notAtCanonicalUrl = env.CanonicalURL.length > 0 && window.location.href != env.CanonicalURL + "/";
        if (notAtCanonicalUrl) {
            const isFirstVisit = Store.Load(Store.User, "SkipIntro") === null;
            if (isFirstVisit) {
                window.location.href = env.CanonicalURL;
            } else {
                this.transferLocalStorageToCanonicalUrl();
            }
        }
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

    private transferLocalStorageToCanonicalUrl() {
        const iframe = document.getElementById("localstorage-transfer-target") as HTMLIFrameElement;
        iframe.onload = () => iframe.contentWindow.postMessage({ transferredLocalStorage: JSON.stringify(localStorage) }, "*");
        window.onmessage = this.markStorageAsTransferredAndRedirect;
    }

    private markStorageAsTransferredAndRedirect(e: MessageEvent) {
        if (e.origin !== env.CanonicalURL) {
            return;
        }
        Store.Save(Store.User, "StorageTransferred", true);
        window.location.href = env.CanonicalURL;
    }
}
