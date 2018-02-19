import { Store } from "./Store";

export class Metrics {
    public static TrackLoad(): void {
        const counts = {
            Encounters: Store.List(Store.SavedEncounters).length,
            NpcStatBlocks: Store.List(Store.StatBlocks).length,
            PcStatBlocks: Store.List(Store.PlayerCharacters).length,
            Spells: Store.List(Store.Spells).length
        };

        Metrics.TrackEvent("AppLoad", counts);
    }

    public static TrackEvent(name: string, data: any = {}): void {
        console.log(`Event ${name}`);
        if (data !== {}) {
            console.table(data);
        }

        data.referrer = { url: document.referrer };
        data.page = { url: document.URL };
        data.localTime = new Date().toString();

        $.ajax({
            type: "POST",
            url: `/recordEvent/${name}`,
            data: JSON.stringify(data || {}),
            contentType: "application/json"
        });
    }
}
