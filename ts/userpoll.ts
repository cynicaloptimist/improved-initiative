/// <reference path="tracker.ts" />

module ImprovedInitiative {
	export interface IUserPoll {
		requestContent: string;
		inputSelector: string;
		callback: (response: any) => void;
	}
	
	export class UserPollQueue {
		Queue: KnockoutObservableArray<IUserPoll> = ko.observableArray<IUserPoll>();
		Add = (poll: IUserPoll) => {
			this.Queue.push(poll);
		}
		Resolve = (form: HTMLFormElement) => {
			var poll = this.Queue()[0];
			poll.callback($(form).find(poll.inputSelector).val());
			this.Queue.shift();
			return false;
		}
		CurrentPoll = ko.pureComputed(() => {
			return this.Queue()[0]
		})
		FocusCurrentPoll = () => {
			if(this.Queue[0])
			{
				$(this.Queue[0].inputSelector).select()
			}
		}
	}
}