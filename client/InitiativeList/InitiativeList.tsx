import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { InitiativeListHeader } from "./InitiativeListHeader";

export function InitiativeList(props: EncounterState<CombatantState>) {
  return (
    <div className="initiative-list">
      <h2>Combatants by Initiative</h2>
      <ul className="combatants">
        <InitiativeListHeader
          encounterActive={props.ActiveCombatantId != null}
        />
      </ul>
    </div>
  );
}
