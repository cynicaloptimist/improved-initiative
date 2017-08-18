module ImprovedInitiative {
    export class EventLog {
        Events = ko.observableArray<string>();
        
        LatestEvent = ko.pureComputed(() => this.Events()[this.Events().length - 1] || "Welcome to Improved Initiative!");
        EventsTail = ko.pureComputed(() => this.Events().slice(0, this.Events().length - 1));
        
        AddEvent = (event: string) => {
            this.Events.push(event);
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

        ToggleCSS = () => this.ShowFullLog() ? 'fa-caret-down' : 'fa-caret-up';

        ShowFullLog = ko.observable<boolean>(false);

        LogHPChange = (damage: number, combatantNames: string) => {
            if (damage > 0) {
                this.AddEvent(`${damage} damage applied to ${combatantNames}.`);
            }
            if (damage < 0) {
                this.AddEvent(`${-damage} HP restored to ${combatantNames}.`);
            }
        }

        private element = $('.event-log');
        
        private scrollToBottomOfLog = () => {
            let scrollHeight = this.element[0].scrollHeight;
            this.element.scrollTop(scrollHeight);
        }
    }
}