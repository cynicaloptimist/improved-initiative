import { Store } from "./Store";

export class Metrics {
    static TrackLoad(): void {
        const counts = {
            Encounters: Store.List(Store.SavedEncounters).length,
            NpcStatBlocks: Store.List(Store.StatBlocks).length,
            PcStatBlocks: Store.List(Store.PlayerCharacters).length,
            Spells: Store.List(Store.Spells).length
        };

        Metrics.TrackEvent("AppLoad", counts);
    }

    static TrackEvent(name: string, data?: object): void {
        console.log(`Event ${name}`);
        if (data !== undefined) {
            console.table(data);
        }

        $.ajax({
            type: "POST",
            url: `/recordEvent/${name}`,
            data: JSON.stringify(data || {}),
            contentType: "application/json"
        });
    }
}
