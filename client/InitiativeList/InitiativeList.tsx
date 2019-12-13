import Tippy from "@tippy.js/react";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";

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

function InitiativeListHeader(props: { encounterActive: boolean }) {
  const encounterStateIcon = props.encounterActive ? "fa-play" : "fa-pause";
  const encounterStateTip = props.encounterActive
    ? "Encounter Active"
    : "Encounter Inactive";
  return (
    <li className="combatant--header">
      <span className="combatant__leftsection">
        <span className="combatant__initiative">
          <Tippy content={encounterStateTip}>
            <span className={"fas " + encounterStateIcon}></span>
          </Tippy>
        </span>
        <span className="combatant__name">Name</span>
        <span className="combatant__hp">
          <span className="fas fa-heart"></span>
        </span>
        <span className="combatant__ac">
          <span className="fas fa-shield-alt"></span>
        </span>
      </span>
      <span className="combatant__rightsection"></span>
    </li>
  );
}
