import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { Tags } from "./Tags";

type CombatantRowProps = {
  combatantState: CombatantState;
  isActive: boolean;
  isSelected: boolean;
  showIndexLabel: boolean;
  selectCombatant: (combatantId: string) => void;
};

export function CombatantRow(props: CombatantRowProps) {
  const displayName = getDisplayName(props);

  return (
    <span
      className={getClassNames(props).join(" ")}
      onClick={() => props.selectCombatant(props.combatantState.Id)}
    >
      <span className="combatant__leftsection">
        <span className={getInitiativeClass(props)} title="Initiative Roll">
          {props.combatantState.Initiative}
        </span>
        <span className="combatant__name" title={displayName}>
          {displayName}
        </span>
        <span className="combatant__hp" style={getHPStyle(props)}>
          {getHPText(props)}
        </span>
        <span className="combatant__ac">
          {props.combatantState.StatBlock.AC.Value}
        </span>
      </span>
      <span className="combatant__rightsection">
        <Tags tags={props.combatantState.Tags} />
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
  } else if (props.showIndexLabel) {
    displayName += " " + props.combatantState.IndexLabel;
  }
  return displayName;
}

function getHPStyle(props: CombatantRowProps) {
  const maxHP = props.combatantState.StatBlock.HP.Value,
    currentHP = props.combatantState.CurrentHP;
  const green = Math.floor((currentHP / maxHP) * 170);
  const red = Math.floor(((maxHP - currentHP) / maxHP) * 170);
  return { color: "rgb(" + red + "," + green + ",0)" };
}

function getHPText(props: CombatantRowProps) {
  const maxHP = props.combatantState.StatBlock.HP.Value;
  if (props.combatantState.TemporaryHP) {
    return `${props.combatantState.CurrentHP}+${props.combatantState.TemporaryHP}/${maxHP}`;
  } else {
    return `${props.combatantState.CurrentHP}/${maxHP}`;
  }
}
