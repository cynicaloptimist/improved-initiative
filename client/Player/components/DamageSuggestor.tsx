import * as React from "react";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { Button } from "../../Components/Button";

export class DamageSuggestor extends React.Component<DamageSuggestorProps> {
  private inputElement: HTMLInputElement;

  public render() {
    return (
      <React.Fragment>
        <div className="modal-blur" onClick={this.props.onClose} />
        <div className="damage-suggestion">
          Apply damage to {this.props.combatant.Name}
          <div className="damage-suggestion__input">
            <input type="number" ref={e => (this.inputElement = e)} />
            <Button fontAwesomeIcon="check" onClick={this.applyDamage} />
          </div>
          <div className="damage-suggestion__tip">
            Use a positive value to damage and a negative value to heal
          </div>
        </div>
      </React.Fragment>
    );
  }

  private applyDamage = () => {
    const inputAmount = parseInt(this.inputElement.value);
    if (inputAmount == NaN) {
      return;
    }
    this.props.onApply(this.props.combatant.Id, inputAmount);
    this.props.onClose();
  };
}

interface DamageSuggestorProps {
  combatant: PlayerViewCombatantState;
  onApply: (combatantId: string, damageAmount: number) => void;
  onClose: () => void;
}
