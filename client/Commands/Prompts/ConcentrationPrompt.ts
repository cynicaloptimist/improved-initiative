import { Combatant } from "../../Combatant/Combatant";
import { Prompt } from "./Prompt";

export class ConcentrationPrompt implements Prompt {
    public static Tag = "Concentrating";
    public InputSelector = ".passcheck";
    public ComponentName = "concentrationprompt";
    public Prompt: string;
    private dequeueCallback: () => void;

    public SetDequeueCallback = callback => this.dequeueCallback = callback;
    public Resolve = (form: HTMLFormElement) => {
        this.dequeueCallback();
    }
    public FailCheck: () => void;

    constructor(combatant: Combatant, damageAmount: number) {
        const concentrationDC = damageAmount > 20 ? Math.floor(damageAmount / 2) : 10;
        const autoRoll = combatant.GetConcentrationRoll();
        this.Prompt = `${combatant.DisplayName()} DC <strong>${concentrationDC}</strong> concentration check (Constitution save). Auto-roll: <strong>${autoRoll}</strong>`;

        this.FailCheck = () => {
            combatant.Tags()
                .filter(t => t.Text === ConcentrationPrompt.Tag)
                .forEach(tag => combatant.Tags.remove(tag));
            this.dequeueCallback();
        };
    }
}
