import { Combatant } from "../../Combatant/Combatant";
import { LegacyPrompt } from "./Prompt";

export class ConcentrationPrompt implements LegacyPrompt {
  public static Tag = "Concentrating";
  public InputSelector = ".passcheck";
  public ComponentName = "concentrationprompt";
  public Prompt: string;

  public Resolve = () => {};
  public FailCheck: () => void;

  constructor(combatant: Combatant, damageAmount: number) {
    const concentrationDC =
      damageAmount > 20 ? Math.floor(damageAmount / 2) : 10;
    const autoRoll = combatant.GetConcentrationRoll();
    this.Prompt = `${combatant.DisplayName()} DC <strong>${concentrationDC}</strong> concentration check (Constitution save). Auto-roll: <strong>${autoRoll}</strong>`;

    this.FailCheck = () => {
      combatant
        .Tags()
        .filter(t => t.Text === ConcentrationPrompt.Tag)
        .forEach(tag => combatant.Tags.remove(tag));
      combatant.Encounter.QueueEmitEncounter();
      return true;
    };
  }
}
