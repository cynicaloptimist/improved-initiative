import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

interface EventData {
  [key: string]: any;
}

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
      Spells: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.Spells
      ).length
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
