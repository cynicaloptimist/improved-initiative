module ImprovedInitiative {
    export class Metrics {
        static TrackEvent = (name: string, data?: object) => {
            console.log(`Event ${name}`);
            if (data !== undefined) {
                console.table(data);
            }
        }
    }
}