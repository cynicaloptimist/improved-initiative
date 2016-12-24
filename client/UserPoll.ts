module ImprovedInitiative {
    export interface IUserPoll {
        requestContent?: string;
        inputSelector?: string;
        callback: (response: any) => void;
    }

    export class UserPollQueue {
        private queue: KnockoutObservableArray<IUserPoll> = ko.observableArray<IUserPoll>();

        constructor() {
            this.queue.subscribe(this.checkForAutoResolve);
        }

        Add = (poll: IUserPoll) => {
            this.queue.push(poll);
        }

        Resolve = (form: HTMLFormElement) => {
            var poll = this.queue()[0];
            poll.callback($(form).find(poll.inputSelector).val());
            this.queue.shift();
            return false;
        }

        HasPoll = ko.pureComputed(() => {
            return this.queue().length > 0;
        });

        Message = ko.pureComputed(() => {
            return `<p>${this.queue()[0].requestContent}</p><button type='submit' class='fa fa-check button'></button>`;
        });

        InputSelector = ko.pureComputed(() => {
            return this.queue()[0].inputSelector;
        }).extend({ notify: 'always' });

        private checkForAutoResolve = () => {
            var poll = this.queue()[0];
            if (poll && !poll.requestContent) {
                poll.callback(null);
                this.queue.shift();
            }
        }
    }
}