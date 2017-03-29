module ImprovedInitiative {
    export class EventLog {
        Events = ko.observableArray<string>();
        
        LatestEvent = ko.computed(() => this.Events()[this.Events().length - 1] || "Welcome to Improved Initiative!");
        EventsTail = ko.computed(() => this.Events().slice(0, this.Events().length - 1));
        
        AddEvent = (event: string) => {
            this.Events.push(event);
            this.scrollToBottomOfLog();
        }

        ToggleFullLog = () => {
            if(this.ShowFullLog()) {
                this.ShowFullLog(false);
                $('.combatants').css('flex-shrink', 1);
            } else {
                this.ShowFullLog(true);
                $('.combatants').css('flex-shrink', 0);
                this.scrollToBottomOfLog();
            }
        }

        ShowFullLog = ko.observable<boolean>(false);

        private scrollToBottomOfLog = () => {
            let scrollHeight = $('.event-log')[0].scrollHeight;
            $('.event-log').scrollTop(scrollHeight);
        }
    }
}