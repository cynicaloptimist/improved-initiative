module ImprovedInitiative {
    export class EventLog {
        Events = ko.observableArray<string>();
        LatestEvent = ko.computed(() => {
            var events = this.Events();
            return events.length > 0 ? events[events.length - 1] : "Welcome to Improved Initiative!";
        });
        AddEvent = (event: string) => this.Events.push(event);
    }
}