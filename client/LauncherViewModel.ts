import * as ko from "knockout";

import { env } from "./Environment";
import { Metrics } from "./Utility/Metrics";
import { Store } from "./Utility/Store";

function transferLocalStorageToCanonicalUrl(canonicalUrl: string) {
    const iframe = document.getElementById("localstorage-transfer-target") as HTMLIFrameElement;
    iframe.onload = () => iframe.contentWindow.postMessage({ transferredLocalStorage: JSON.stringify(localStorage) }, "*");
    window.onmessage = getTransferCompleteCallback(canonicalUrl);
}

function getTransferCompleteCallback(canonicalUrl: string) {
    return (e: MessageEvent) => {
        if (e.origin !== canonicalUrl) {
            return;
        }
        Store.Save(Store.User, "StorageTransferred", true);
        window.location.href = canonicalUrl;
    };
}

export function TransferLocalStorageToCanonicalURLIfNeeded(canonicalUrl: string) {
    const notAtCanonicalUrl = canonicalUrl.length > 0 && window.location.href != canonicalUrl + "/";
    if (notAtCanonicalUrl) {
        const isFirstVisit = Store.Load(Store.User, "SkipIntro") === null;
        if (isFirstVisit) {
            window.location.href = canonicalUrl;
        } else {
            transferLocalStorageToCanonicalUrl(canonicalUrl);
        }
    }
}
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
