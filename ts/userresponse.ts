module ImprovedInitiative {
	export interface IUserResponseRequest {
		requestContent: string;
		inputSelector: string;
		callback: (response: HTMLFormElement) => void;
	}
	
	export class UserResponseRequest implements IUserResponseRequest{
		constructor(public requestContent, public inputSelector: string, public callback: (response: HTMLFormElement) => void, stack: KnockoutObservableArray<IUserResponseRequest>){
			this.stack = stack;
		}
		private stack: KnockoutObservableArray<IUserResponseRequest>;
		
		HandleResponse = (form: HTMLFormElement) => {
			this.callback($(form).find(this.inputSelector).val());
			this.stack.remove(this);
			return false;
		}
	}
}