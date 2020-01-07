import * as React from "react";

import { CombatantState } from "../../common/CombatantState";

type CombatantRowProps = {
  combatantState: CombatantState;
  isActive: boolean;
  isSelected: boolean;
  showIndexLabel: boolean;
};

export function CombatantRow(props: CombatantRowProps) {
  const classNames = getClassNames(props);

  let initiativeClass = getInitiativeClass(props);

  let displayName = getDisplayName(props);

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

function getClassNames(props: CombatantRowProps) {
  const classNames = ["combatant"];
  if (props.isActive) {
    classNames.push("active");
  }
  if (props.isSelected) {
    classNames.push("selected");
  }
  return classNames;
}

function getInitiativeClass(props: CombatantRowProps) {
  let initiativeClass = "combatant__initiative";
  if (props.combatantState.InitiativeGroup) {
    initiativeClass += " fas fa-link";
  }
  return initiativeClass;
}

function getDisplayName(props: CombatantRowProps) {
  let displayName = props.combatantState.StatBlock.Name;
  if (props.combatantState.Alias.length) {
    displayName = props.combatantState.Alias;
  }
  else if (props.showIndexLabel) {
    displayName += " " + props.combatantState.IndexLabel;
  }
  return displayName;
}

