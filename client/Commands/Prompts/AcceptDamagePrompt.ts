module ImprovedInitiative {
    export class AcceptDamagePrompt implements Prompt {
        InputSelector = '.passcheck';
        ComponentName = 'acceptdamageprompt';
        Prompt: string;
        private dequeueCallback: () => void;

        SetDequeueCallback = callback => this.dequeueCallback = callback;
        Resolve = (form: HTMLFormElement) => {
            this.dequeueCallback();
        };
        PassCheck: () => void;

        constructor(combatantNames: string, damageAmount: number, suggester: string, resolve: (responses: { [id: string]: string }) => void) {
            const displayType = (damageAmount < 0) ? "healing" : "damage";
            const displayNumber = (damageAmount < 0) ? -damageAmount : damageAmount;
            this.Prompt = `Accept ${displayNumber} ${displayType} to ${combatantNames} from ${suggester}?`;

            this.PassCheck = () => {
                resolve({'damage': `${damageAmount}`});
                this.dequeueCallback();
            }
        }
    }
}
