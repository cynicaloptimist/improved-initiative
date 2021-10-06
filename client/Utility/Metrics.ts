import axios from "axios";
import { env } from "../Environment";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

interface EventData {
  [key: string]: any;
}

type GoogleAnalyticsTag = (
  command: "send",
  event: "event",
  eventCategory: string,
  eventAction: string,
  eventLabel?: string,
  eventValue?: number
) => void;

declare let gtag: GoogleAnalyticsTag | undefined;

export class Metrics {
  public static async TrackLoad() {
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
  }

  public static TrackEvent(name: string, eventData: EventData = {}): void {
    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    console.log(`Event ${name}`);
    if (eventData !== {}) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      for (const key of Object.keys(eventData)) {
        if (typeof eventData[key] == "number") {
          gtag("send", "event", name, key, undefined, eventData[key]);
        } else {
          gtag("send", "event", name, key, JSON.stringify(eventData[key]));
        }
      }
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
    if (eventData !== {}) {
      console.table(eventData);
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
