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

        constructor(suggestedCombatants: CombatantViewModel [], damageAmount: number, suggester: string) {
            const combatantNames = suggestedCombatants.map(c => c.Name()).join(', ');
            const displayType = (damageAmount < 0) ? "healing" : "damage";
            const displayNumber = (damageAmount < 0) ? -damageAmount : damageAmount;
            this.Prompt = `Accept ${displayNumber} ${displayType} to ${combatantNames} from ${suggester}?`;

            this.AcceptFull = () => {
                suggestedCombatants.forEach(c => c.ApplyDamage(damageAmount.toString()))
                this.dequeueCallback();
            }

            this.AcceptHalf = () => {
                const halfDamage = Math.floor(damageAmount / 2).toString();
                suggestedCombatants.forEach(c => c.ApplyDamage(halfDamage));
                this.dequeueCallback();
            }
        }
    }
}
