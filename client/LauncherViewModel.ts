import * as ko from "knockout";

import { env } from "./Environment";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { Metrics } from "./Utility/Metrics";
import { TransferLocalStorageToCanonicalURLIfNeeded } from "./Utility/TransferLocalStorage";

export class LauncherViewModel {
  constructor() {
    const pageLoadData = {
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };
    Metrics.TrackAnonymousEvent("LandingPageLoad", pageLoadData);

    TransferLocalStorageToCanonicalURLIfNeeded(env.BaseUrl);
  }

  public GeneratedEncounterId = env.EncounterId;
  public JoinEncounterInput = ko.observable<string>("");

  public StartEncounter = () => {
    const encounterId = this.JoinEncounterInput()
      .split("/")
      .pop();
    LegacySynchronousLocalStore.Delete(
      LegacySynchronousLocalStore.AutoSavedEncounters,
      LegacySynchronousLocalStore.DefaultSavedEncounterId
    );
    window.location.href = `e/${encounterId || this.GeneratedEncounterId}`;
  };

  public JoinEncounter = () => {
    const encounterId = this.JoinEncounterInput()
      .split("/")
      .pop();

    if (encounterId) {
      window.location.href = `p/${encounterId}`;
    }
  };

  public JoinEncounterButtonClass = () => {
    const encounterId = this.JoinEncounterInput()
      .split("/")
      .pop();
    return encounterId ? "enabled" : "disabled";
  };
}
