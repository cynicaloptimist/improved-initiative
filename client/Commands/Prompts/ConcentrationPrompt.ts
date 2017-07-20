module ImprovedInitiative {
    export class ConcentrationPrompt implements Prompt {
        static Tag = "Concentrating"
        InputSelector = '.passcheck';
        ComponentName = 'concentrationprompt';
        Prompt: string;
        private dequeueCallback: () => void;

        SetDequeueCallback = callback => this.dequeueCallback = callback;
        Resolve = (form: HTMLFormElement) => {
            this.dequeueCallback();
        };
        FailCheck: () => void;

        constructor(combatant: Combatant, damageAmount: number) {
            const concentrationDC = damageAmount > 20 ? Math.floor(damageAmount / 2) : 10;
            const autoRoll = combatant.GetConcentrationRoll();
            this.Prompt = `${combatant.ViewModel.DisplayName()} needs a DC <strong>${concentrationDC}</strong> concentration check. Auto-roll: <strong>${autoRoll}</strong>`;

            this.FailCheck = () => {
                combatant.Tags()
                    .filter(t => t.Text === ConcentrationPrompt.Tag)
                    .forEach(tag => combatant.ViewModel.RemoveTag(tag));
                this.dequeueCallback();
            }
        }
    }
}