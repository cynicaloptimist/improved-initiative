module ImprovedInitiative {
    export class AcceptDamagePrompt implements Prompt {
        InputSelector = '.acceptfull';
        ComponentName = 'acceptdamageprompt';
        Prompt: string;
        private dequeueCallback: () => void;

        SetDequeueCallback = callback => this.dequeueCallback = callback;
        Resolve = (form: HTMLFormElement) => {
            this.dequeueCallback();
        };
        AcceptFull: () => void;
        AcceptHalf: () => void;

        constructor(combatantNames: string, damageAmount: number, suggester: string, resolve: (responses: { [id: string]: string }) => void) {
            const displayType = (damageAmount < 0) ? "healing" : "damage";
            const displayNumber = (damageAmount < 0) ? -damageAmount : damageAmount;
            this.Prompt = `Accept ${displayNumber} ${displayType} to ${combatantNames} from ${suggester}?`;

            this.AcceptFull = () => {
                resolve({'damage': `${damageAmount}`});
                this.dequeueCallback();
            }

            this.AcceptHalf = () => {
                resolve({'damage': `${Math.floor(damageAmount / 2)}`});
                this.dequeueCallback();
            }
        }
    }
}
