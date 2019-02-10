import * as React from "react";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { Button } from "../../Components/Button";

export class DamageSuggestor extends React.Component<DamageSuggestorProps> {
  public render() {
    return (
      <React.Fragment>
        <div className="modal-blur" onClick={this.props.onClose} />
        <div className="damage-suggestion">
          Suggest damage/healing for {this.props.combatant.Name}:
          <input type="number" name="suggestedDamage" />
          <Button fontAwesomeIcon="check" onClick={() => alert("BARF")} />
          <div className="tip">
            Use a positive value to damage and a negative value to heal
          </div>
        </div>
      </React.Fragment>
    );
  }
}
interface DamageSuggestorProps {
  combatant: PlayerViewCombatantState;
  onClose: () => void;
}
