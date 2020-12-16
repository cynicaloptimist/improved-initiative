import * as React from "react";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { CombatantDetails } from "../Combatant/CombatantDetails";
import { Button } from "../Components/Button";
import { CombatantCommander } from "../Commands/CombatantCommander";
import { MultipleCombatantDetails } from "../Combatant/MultipleCombatantDetails";

export function SelectedCombatants(props: {
  combatantCommander: CombatantCommander;
}) {
  const { combatantCommander } = props;
  const selectedCombatants = useSubscription(
    combatantCommander.SelectedCombatants
  );

  if (selectedCombatants.length === 0) {
    return (
      <div className="selected-combatant">
        <h2>No Combatant Selected</h2>
      </div>
    );
  }

  if (selectedCombatants.length === 1) {
    return (
      <div className="selected-combatant">
        <div className="combatant-details__header">
          <h2>Selected Combatant</h2>
          <Button
            fontAwesomeIcon="times"
            onClick={combatantCommander.Deselect}
          />
        </div>
        <CombatantDetails
          key={selectedCombatants[0].Combatant.Id}
          combatantViewModel={selectedCombatants[0]}
          displayMode="default"
        />
      </div>
    );
  } else {
    return (
      <div className="selected-combatant">
        <div className="combatant-details__header">
          <h2>Selected Combatants</h2>
          <Button
            fontAwesomeIcon="times"
            onClick={combatantCommander.Deselect}
          />
        </div>
        <MultipleCombatantDetails combatants={selectedCombatants} />
      </div>
    );
  }
}
