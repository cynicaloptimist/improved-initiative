import * as ko from "knockout";

import { env } from "./Environment";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { Metrics } from "./Utility/Metrics";
import { TransferLocalStorageToCanonicalURLIfNeeded } from "./Utility/TransferLocalStorage";

export class LauncherViewModel {
  constructor() {
    const pageLoadData = {
      userAgent: navigator.userAgent
    };
    Metrics.TrackAnonymousEvent("LandingPageLoad", pageLoadData);

    this.cleanAffiliateUrl();

    TransferLocalStorageToCanonicalURLIfNeeded(env.BaseUrl);
  }

  private cleanAffiliateUrl() {
    if (window.URLSearchParams && window.history) {
      const params = new URLSearchParams(window.location.search);
      let didRemoveParams = false;
      for (const key of Array.from(params.keys())) {
        if (key.indexOf("utm_") === 0) {
          didRemoveParams = true;
          params.delete(key);
        }
      }
      if (didRemoveParams) {
        const query = params.toString() ? "?" + params.toString() : "";
        const cleanUrl =
          window.location.pathname + query + window.location.hash;
        window.history.replaceState(null, "", cleanUrl);
      }
    }
  }

  public GeneratedEncounterId = env.EncounterId;
  public JoinEncounterInput = ko.observable<string>("");

  public StartEncounter = (): void => {
    const encounterId = this.JoinEncounterInput().split("/").pop();
    LegacySynchronousLocalStore.Delete(
      LegacySynchronousLocalStore.AutoSavedEncounters,
      LegacySynchronousLocalStore.DefaultSavedEncounterId
    );
    window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
  };

  public JoinEncounter = (): void => {
    const encounterId = this.JoinEncounterInput().split("/").pop();

    if (encounterId) {
      window.location.href = `p/${encounterId}`;
    }
  };

  public JoinEncounterButtonClass = (): string => {
    const encounterId = this.JoinEncounterInput().split("/").pop();
    return encounterId ? "enabled" : "disabled";
  };
}
