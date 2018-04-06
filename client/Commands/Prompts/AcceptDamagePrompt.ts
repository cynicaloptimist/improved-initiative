import { CombatantViewModel } from "../../Combatant/CombatantViewModel";
import { TrackerViewModel } from "../../TrackerViewModel";
import { Prompt } from "./Prompt";

export class AcceptDamagePrompt implements Prompt {
    public InputSelector = ".acceptfull";
    public ComponentName = "acceptdamageprompt";
    public Prompt: string;


    public Resolve = (form: HTMLFormElement) => {
    }
    public AcceptFull: () => void;
    public AcceptHalf: () => void;

    constructor(suggestedCombatants: CombatantViewModel[], damageAmount: number, suggester: string, tracker: TrackerViewModel) {
        const combatantNames = suggestedCombatants.map(c => c.Name()).join(", ");
        const displayType = (damageAmount < 0) ? "healing" : "damage";
        const displayNumber = (damageAmount < 0) ? -damageAmount : damageAmount;
        this.Prompt = `Accept ${displayNumber} ${displayType} to ${combatantNames} from ${suggester}?`;

        this.AcceptFull = () => {
            suggestedCombatants.forEach(c => c.ApplyDamage(damageAmount.toString()));
            tracker.EventLog.LogHPChange(damageAmount, combatantNames);
            tracker.Encounter.QueueEmitEncounter();
        };

        this.AcceptHalf = () => {
            const halfDamage = Math.floor(damageAmount / 2);
            suggestedCombatants.forEach(c => c.ApplyDamage(halfDamage.toString()));
            tracker.EventLog.LogHPChange(halfDamage, combatantNames);
            tracker.Encounter.QueueEmitEncounter();
        };
    }
}
