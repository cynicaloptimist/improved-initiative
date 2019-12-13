import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { CombatantRow } from "./CombatantRow";
import { InitiativeListHeader } from "./InitiativeListHeader";

export function InitiativeList(props: EncounterState<CombatantState>) {
  return (
    <div className="initiative-list">
      <h2>Combatants by Initiative</h2>
      <ul className="combatants">
        <InitiativeListHeader
          encounterActive={props.ActiveCombatantId != null}
        />
        {props.Combatants.map(combatantState => {
          return (
            <CombatantRow
              combatantState={combatantState}
              isActive={props.ActiveCombatantId == combatantState.Id}
              isSelected={false}
              showIndexLabel={
                props.Combatants.filter(
                  c => c.StatBlock.Name == combatantState.StatBlock.Name
                ).length > 1
              }
            />
          );
        })}
      </ul>
    </div>
  );
}
