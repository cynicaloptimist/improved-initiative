import * as React from "react";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { SubmitButton } from "../../Components/Button";

export class DamageSuggestor extends React.Component<DamageSuggestorProps> {
  private inputElement: HTMLInputElement;

  public componentDidMount = () => {
    this.inputElement.focus();
  };

  public render() {
    return (
      <form onSubmit={this.applyDamage} className="damage-suggestion">
        Apply damage to {this.props.combatant.Name}
        <div className="damage-suggestion__input">
          <input type="number" ref={e => (this.inputElement = e)} />
          <SubmitButton />
        </div>
        <div className="damage-suggestion__tip">
          Use a positive value to damage and a negative value to heal
        </div>
      </form>
    );
  }

  private applyDamage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputAmount = parseInt(this.inputElement.value);
    this.props.onApply(this.props.combatant.Id, inputAmount);
  };
}

export type ApplyDamageCallback = (
  combatantId: string,
  damageAmount: number
) => void;

interface DamageSuggestorProps {
  combatant: PlayerViewCombatantState;
  onApply: ApplyDamageCallback;
}
