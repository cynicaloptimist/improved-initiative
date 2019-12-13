import * as React from "react";

import { CombatantState } from "../../common/CombatantState";

export function CombatantRow(props: {
  combatantState: CombatantState;
  isActive: boolean;
  isSelected: boolean;
  showIndexLabel: boolean;
}) {
  const displayName = props.combatantState.Alias.length
    ? props.combatantState.Alias
    : props.combatantState.StatBlock.Name +
      " " +
      props.combatantState.IndexLabel;
  return (
    <span className="combatant">
      <span className="combatant__leftsection">
        <span className="combatant__name" title={displayName}>
          {displayName}
        </span>
      </span>
    </span>
  );
}
