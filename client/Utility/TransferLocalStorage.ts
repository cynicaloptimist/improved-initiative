import { Store } from "./Store";

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
        const storageAlreadyTransferred = Store.Load(Store.User, "StorageTransferred") == true;
        if (isFirstVisit || storageAlreadyTransferred) {
            window.location.href = canonicalUrl;
        } else {
            transferLocalStorageToCanonicalUrl(canonicalUrl);
        }
    }
}
