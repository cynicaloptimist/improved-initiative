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
      Encounters: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.SavedEncounters
      ).length,
      NpcStatBlocks: (await Store.LoadAllAndUpdateIds(Store.StatBlocks)).length,
      PcStatBlocks: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.PlayerCharacters
      ).length,
      PersistentCharacters: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.PersistentCharacters
      ).length,
      Spells: (await Store.LoadAllAndUpdateIds(Store.Spells)).length
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

    $.ajax({
      type: "POST",
      url: `/recordEvent/${name}`,
      data: JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      contentType: "application/json"
    });
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

    $.ajax({
      type: "POST",
      url: `/recordAnonymousEvent/${name}`,
      data: JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      contentType: "application/json"
    });
  }

  private static getLocalMeta() {
    return {
      referrerUrl: document.referrer,
      pageUrl: document.URL,
      localTime: new Date().getTime()
    };
  }
}
