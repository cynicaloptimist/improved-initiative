module ImprovedInitiative {
    export interface Poll {
        InputSelector: string;
        ComponentName: string;
        Resolve: (form: HTMLFormElement) => void;
        SetDequeueCallback: (callback: () => void) => void;
    }

    export class DefaultPoll implements Poll {
        constructor(public Query: string, private resolve: (responses: {[id: string]: string}) => void) {}
        private dequeue = () => { };
        InputSelector = ".response";
        ComponentName = "defaultpoll";
        SetDequeueCallback = callback => this.dequeue = callback;
        Resolve = (form: HTMLFormElement) => {
            const inputs = $(form).find(this.InputSelector);
            const inputsById = {};
            inputs.map((_, element) => {
                inputsById[element.id] = $(element).val();
            });
            this.resolve(inputsById);
            this.dequeue();
        }
    }

    export class UserPollQueue {
        constructor() {}

        Polls = ko.observableArray<Poll>();
        
        Add = (poll: Poll) => {
            poll.SetDequeueCallback(() => {
                this.Polls.remove(poll)
                if (this.HasPoll()) {
                    $(this.Polls()[0].InputSelector).first().select();
                }
            });
            this.Polls.push(poll);
        }

        HasPoll = ko.pureComputed(() => {
            return this.Polls().length > 0;
        });

        AnimatePoll = () => {
            if (!this.HasPoll()) {
                return;
            }
            const opts = { duration: 200 };
            const up = { "margin-bottom": "+=10" };
            const down = { "margin-bottom": "-=10" };
            $('.user-poll')
                .animate(up, opts)
                .animate(down, opts)
                .find(this.Polls()[0].InputSelector)
                .first()
                .select();
        }
    }
}