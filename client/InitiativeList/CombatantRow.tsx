import * as React from "react";

import { CombatantState } from "../../common/CombatantState";

export function CombatantRow(props: {
  combatantState: CombatantState;
  isActive: boolean;
  isSelected: boolean;
  showIndexLabel: boolean;
}) {
  const classNames = ["combatant"];
  if (props.isActive) {
    classNames.push("active");
  }
  if (props.isSelected) {
    classNames.push("selected");
  }

  let initiativeClass = "combatant__initiative";
  if (props.combatantState.InitiativeGroup) {
    initiativeClass += " fas fa-link";
  }

  let displayName = props.combatantState.StatBlock.Name;
  if (props.combatantState.Alias.length) {
    displayName = props.combatantState.Alias;
  } else if (props.showIndexLabel) {
    displayName += " " + props.combatantState.IndexLabel;
  }

  return (
    <span className={classNames.join(" ")}>
      <span className="combatant__leftsection">
        <span className={initiativeClass} title="Initiative Roll">
          {props.combatantState.Initiative}
        </span>
        <span className="combatant__name" title={displayName}>
          {displayName}
        </span>
      </span>
    </span>
  );
}
