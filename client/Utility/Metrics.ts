import axios from "axios";
import { env } from "../Environment";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

declare let gtag: Gtag.Gtag | undefined;

let didSetConsent = false;

export class Metrics {
  public static async TrackLoad(): Promise<void> {
    const counts = {
      Encounters: await Store.Count(Store.SavedEncounters),
      NpcStatBlocks: await Store.Count(Store.StatBlocks),
      PcStatBlocks: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.PlayerCharacters
      ).length,
      PersistentCharacters: await Store.Count(Store.PersistentCharacters),
      Spells: await Store.Count(Store.Spells)
    };

    Metrics.TrackEvent("AppLoad", counts);
    const queryParams = new URLSearchParams(window.location.search);
    const loginMethod = queryParams.get("login");
    if (loginMethod) {
      Metrics.TrackEvent("login", {
        method: loginMethod
      });
      Metrics.RecordGoogleAnalyticsClientId();
      queryParams.delete("login");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  public static TrackPatreonSignupIntent(
    source: string,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackAnonymousEvent("generate_lead", {
      lead_source: source,
      items: [
        {
          item_id: "patreon_membership",
          item_name: "Patreon Membership"
        }
      ],
      ...eventData
    });
  }

  public static TrackEvent(
    name: string,
    eventData: Record<string, any> = {}
  ): void {
    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    console.log(`Event ${name}`);
    if (Object.keys(eventData).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      try {
        if (!didSetConsent) {
          gtag("consent", "update", {
            analytics_storage: "granted"
          });
          didSetConsent = true;
        }

        gtag("event", name, eventData);
      } catch (e) {}
    }

    if (!env.SendMetrics) {
      return;
    }

    axios.post(
      `/recordEvent/${name}`,
      JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      {
        headers: { "content-type": "application/json" }
      }
    );
  }

  public static TrackAnonymousEvent(
    name: string,
    eventData: Record<string, any> = {}
  ): void {
    console.log(`Anonymous Event ${name}`);
    if (Object.keys(eventData).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      try {
        gtag("event", name, eventData);
      } catch (e) {}
    }

    if (!env.SendMetrics) {
      return;
    }

    axios.post(
      `/recordAnonymousEvent/${name}`,
      JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      {
        headers: { "content-type": "application/json" }
      }
    );
  }

  public static RecordGoogleAnalyticsClientId(): void {
    if (!env.GoogleAnalyticsId || typeof gtag != "function") {
      return;
    }

    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    try {
      gtag(
        "get",
        env.GoogleAnalyticsId,
        "client_id",
        googleAnalyticsClientId => {
          if (typeof googleAnalyticsClientId !== "string") {
            return;
          }

          axios.post(
            "/recordGoogleAnalyticsClientId",
            JSON.stringify({
              googleAnalyticsClientId,
              meta: Metrics.getLocalMeta()
            }),
            {
              headers: { "content-type": "application/json" }
            }
          );
        }
      );
    } catch (e) {}
  }

  private static getLocalMeta() {
    return {
      referrerUrl: document.referrer,
      pageUrl: document.URL,
      localTime: new Date().getTime()
    };
  }
}
