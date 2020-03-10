import * as React from "react";

import { CombatantState, TagState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { CombatantRow } from "./CombatantRow";
import { InitiativeListHeader } from "./InitiativeListHeader";

export function InitiativeList(props: {
  encounterState: EncounterState<CombatantState>;
  selectedCombatantIds: string[];
  combatantCountsByName: { [name: string]: number };
}) {
  const encounterState = props.encounterState;

  return (
    <div>
      <h2>Combatants by Initiative</h2>
      <ul className="combatants">
        <InitiativeListHeader
          encounterActive={encounterState.ActiveCombatantId != null}
        />
        {encounterState.Combatants.map(combatantState => {
          const siblingCount =
            props.combatantCountsByName[combatantState.StatBlock.Name] || 1;

          return (
            <CombatantRow
              key={combatantState.Id}
              combatantState={combatantState}
              isActive={encounterState.ActiveCombatantId == combatantState.Id}
              isSelected={props.selectedCombatantIds.some(
                id => id == combatantState.Id
              )}
              // Show index labels if the encounter has ever had more than one
              // creature with this name.
              showIndexLabel={siblingCount > 1}
            />
          );
        })}
      </ul>
    </div>
  );
}
