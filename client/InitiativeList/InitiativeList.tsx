import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { CombatantRow } from "./CombatantRow";
import { InitiativeListHeader } from "./InitiativeListHeader";
import { RestoreCombatants } from "./RestoreCombatants";

export function InitiativeList(props: {
  encounterState: EncounterState<CombatantState>;
  selectedCombatantIds: string[];
  combatantCountsByName: { [name: string]: number };
}) {
  const encounterState = props.encounterState;
  const showManaColumn = encounterState.Combatants.some(
    c => c.StatBlock.Mana
  );

  return (
    <div className="initiative-list">
      <h2>Combatants by Initiative</h2>
      <table className="combatants">
        <InitiativeListHeader
          encounterActive={encounterState.ActiveCombatantId != null}
          showManaColumn={showManaColumn}
        />
        <tbody>
          {encounterState.Combatants.map((combatantState, index) => {
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
                initiativeIndex={index}
                showManaColumn={showManaColumn}
              />
            );
          })}
        </tbody>
      </table>
      <RestoreCombatants />
    </div>
  );
}
