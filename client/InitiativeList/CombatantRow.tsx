import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { Tags } from "./Tags";
import { CommandContext } from "./CommandContext";
import Tippy from "@tippy.js/react";

type CombatantRowProps = {
  combatantState: CombatantState;
  isActive: boolean;
  isSelected: boolean;
  showIndexLabel: boolean;
};

export function CombatantRow(props: CombatantRowProps) {
  const displayName = getDisplayName(props);
  const commandContext = React.useContext(CommandContext);

  const { combatantState, isSelected, isActive } = props;
  const { StatBlock } = combatantState;

  const selectCombatant = () => {
    commandContext.SelectCombatant(props.combatantState.Id);
  };

  return (
    <tr className={getClassNames(props).join(" ")} onClick={selectCombatant}>
      <td className={getInitiativeClass(props)} title="Initiative Roll">
        {props.combatantState.Initiative}
      </td>

      <td aria-hidden="true" className="combatant__image-cell">
        <img
          src={StatBlock.ImageURL || "/img/logo-improved-initiative.svg"}
          alt="" // Image is only decorative
          className="combatant__image"
          height={35}
          width={35}
        />
      </td>

      <td
        className="combatant__name"
        title={displayName}
        align="left"
        aria-current={isActive ? "true" : "false"}
      >
        {props.combatantState.Hidden && (
          <Tippy content="Hidden from Player View" boundary="window">
            <span className="combatant__hidden-icon fas fa-eye-slash" />
          </Tippy>
        )}
        <button
          className="combatant__selection-button"
          onClick={e => {
            e.stopPropagation();
            selectCombatant();
          }}
          aria-pressed={isSelected ? "true" : "false"}
        >
          {displayName}
        </button>
      </td>

      <td
        className="combatant__hp"
        style={getHPStyle(props)}
        onClick={event => {
          commandContext.ApplyDamageToCombatant(props.combatantState.Id);
          event.stopPropagation();
        }}
      >
        <span
          className="combatant__mobile-icon fas fa-heart"
          aria-hidden="true"
        />

        {renderHPText(props)}
      </td>

      <td className="combatant__ac">
        <span
          className="combatant__mobile-icon fas fa-shield-alt"
          aria-hidden="true"
        />

        {props.combatantState.StatBlock.AC.Value}
      </td>

      <td className="combatant__tags-cell">
        <Tags
          tags={props.combatantState.Tags}
          combatantId={props.combatantState.Id}
        />
      </td>

      <td className="combatant__commands-cell">
        <Commands />
      </td>
    </tr>
  );
}

function Commands() {
  const commandContext = React.useContext(CommandContext);

  return (
    <div className="combatant__commands">
      {commandContext.InlineCommands.map(c => (
        <Tippy content={`${c.Description} [${c.KeyBinding}]`} key={c.Id}>
          <button
            className={
              "combatant__command-button fa-clickable fa-" + c.FontAwesomeIcon
            }
            onClick={c.ActionBinding}
            aria-label={c.Description}
          ></button>
        </Tippy>
      ))}
    </div>
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
  // Do not set green any higher, low value is needed for contrast against light background
  const green = Math.floor((currentHP / maxHP) * 120);
  const red = Math.floor(((maxHP - currentHP) / maxHP) * 170);
  return { color: "rgb(" + red + "," + green + ",0)" };
}

function renderHPText(props: CombatantRowProps) {
  const maxHP = props.combatantState.StatBlock.HP.Value;
  if (props.combatantState.TemporaryHP) {
    return `${props.combatantState.CurrentHP}+${props.combatantState.TemporaryHP}/${maxHP}`;
  } else {
    return `${props.combatantState.CurrentHP}/${maxHP}`;
  }
}
