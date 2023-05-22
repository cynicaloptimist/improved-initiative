import axios from "axios";
import { env } from "../Environment";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

interface EventData {
  [key: string]: any;
}

declare let gtag: Gtag.Gtag | undefined;

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
      queryParams.delete("login");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  public static TrackEvent(
    name: string,
    eventData?: Record<string, any>
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
    if (Object.keys(eventData ?? {}).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      gtag("event", name, eventData);
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
    eventData: EventData = {}
  ): void {
    console.log(`Anonymous Event ${name}`);
    if (Object.keys(eventData ?? {}).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      gtag("event", name, eventData);
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

  private static getLocalMeta() {
    return {
      referrerUrl: document.referrer,
      pageUrl: document.URL,
      localTime: new Date().getTime()
    };
  }
}
