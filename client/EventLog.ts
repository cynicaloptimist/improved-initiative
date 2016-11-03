module ImprovedInitiative {
    export class EventLog {
        Events = ko.observableArray<string>();
        LatestEvent = ko.computed(() => this.Events()[this.Events().length - 1]);
        AddEvent = (event: string) => this.Events.push(event);
    }
}