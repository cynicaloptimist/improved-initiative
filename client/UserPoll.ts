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
            const poll = this.queue()[0];
            const inputs = $(form).find(poll.inputSelector);
            if (inputs.length === 1) {
                poll.callback(inputs.val());
            } else {
                const inputsById = {};
                inputs.map((_, element) => {
                    inputsById[element.id] = $(element).val();
                });
                poll.callback(inputsById);
            }
            
            this.queue.shift();
            return false;
        }

        HasPoll = ko.pureComputed(() => {
            return this.queue().length > 0;
        });

        Message = ko.pureComputed(() => {
            return `${this.queue()[0].requestContent}<button type='submit' class='fa fa-check button'></button>`;
        });

        InputSelector = ko.pureComputed(() => {
            return this.queue()[0].inputSelector;
        }).extend({ notify: 'always' });

        AnimatePoll = () => {
            const opts = { duration: 200 };
            const up = { "margin-bottom": "+=10" };
            const down = { "margin-bottom": "-=10" };
            $('.user-poll')
                .animate(up, opts)
                .animate(down, opts)
                .find(this.InputSelector())
                .first()
                .select();
            
        }

        private checkForAutoResolve = () => {
            var poll = this.queue()[0];
            if (poll && !poll.requestContent) {
                poll.callback(null);
                this.queue.shift();
            }
        }
    }
}