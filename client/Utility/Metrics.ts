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
      NpcStatBlocks: (await Store.List(Store.StatBlocks)).length,
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

  public static TrackEvent(name: string, data: EventData = {}): void {
    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    console.log(`Event ${name}`);
    if (data !== {}) {
      console.table(data);
    }

    data.referrer = { url: document.referrer };
    data.page = { url: document.URL };
    data.localTime = new Date().getTime();

    $.ajax({
      type: "POST",
      url: `/recordEvent/${name}`,
      data: JSON.stringify(data || {}),
      contentType: "application/json"
    });
  }

  public static TrackAnonymousEvent(name: string, data: EventData = {}): void {
    console.log(`Anonymous Event ${name}`);
    if (data !== {}) {
      console.table(data);
    }

    data.referrer = { url: document.referrer };
    data.page = { url: document.URL };
    data.localTime = new Date().getTime();

    $.ajax({
      type: "POST",
      url: `/recordAnonymousEvent/${name}`,
      data: JSON.stringify(data || {}),
      contentType: "application/json"
    });
  }
}
