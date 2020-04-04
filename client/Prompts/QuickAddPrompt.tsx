import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { SubmitButton } from "../Components/Button";
import { Metrics } from "../Utility/Metrics";
import { LegacyPrompt } from "../Commands/Prompt";

const promptClassName = "p-quick-add";
const inputClassName = promptClassName + "-input";

interface QuickAddPromptProps {}
interface QuickAddPromptState {}
class QuickAddPromptComponent extends React.Component<
  QuickAddPromptProps,
  QuickAddPromptState
> {
  private focusInput: HTMLInputElement;
  public componentDidMount() {
    this.focusInput.focus();
  }

  public render() {
    return (
      <div className={promptClassName}>
        Quick Add Combatant
        <input
          ref={i => (this.focusInput = i)}
          name="name"
          className={inputClassName}
          type="text"
          placeholder="Name"
        />
        <input
          className={inputClassName}
          name="hp"
          type="number"
          placeholder="HP"
        />
        <input
          className={inputClassName}
          name="ac"
          type="number"
          placeholder="AC"
        />
        <input
          className={inputClassName}
          name="initiative"
          type="number"
          placeholder="Init"
        />
        <SubmitButton />
      </div>
    );
  }
}

export class QuickAddPrompt implements LegacyPrompt {
  public InputSelector = "." + inputClassName;
  public ComponentName = "reactprompt";

  constructor(private addStatBlock: (statBlock: StatBlock) => void) {}

  public Resolve = (form: HTMLFormElement) => {
    const name = form.elements["name"].value || "New Combatant";
    const maxHP = parseInt(form.elements["hp"].value) || 1;
    const ac = parseInt(form.elements["ac"].value) || 10;
    const initiative = parseInt(form.elements["initiative"].value) || 0;

    const statBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: name,
      HP: { Value: maxHP, Notes: "" },
      AC: { Value: ac, Notes: "" },
      InitiativeModifier: initiative
    };

    this.addStatBlock(statBlock);
    Metrics.TrackEvent("CombatantQuickAdded", { Name: name });
  };

  public component = (<QuickAddPromptComponent />);
}
