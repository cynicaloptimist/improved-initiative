import * as React from "react";
import { AutoGroupInitiativeOption } from "../../common/Settings";
import { toModifierString } from "../../common/Toolbox";
import { Combatant } from "../Combatant/Combatant";
import { SubmitButton } from "../Components/Button";
import { CurrentSettings } from "../Settings/Settings";
import { NotifyTutorialOfAction } from "../Tutorial/NotifyTutorialOfAction";
import { PromptProps } from "./PendingPrompts";
import _ = require("lodash");
import { Field } from "formik";

interface InitiativePromptComponentProps {
  playerCharacters: Combatant[];
  nonPlayerCharacters: Combatant[];
}

function InitiativePromptComponent(props: InitiativePromptComponentProps) {
  return (
    <div className="roll-initiative">
      <div className="roll-initiative__header">
        <h4>Roll Initiative</h4>
        <SubmitButton />
      </div>
      <ul className="playercharacters">
        {props.playerCharacters.map(combatantInitiativeField)}
      </ul>
      <ul className="nonplayercharacters">
        {props.nonPlayerCharacters.map(combatantInitiativeField)}
      </ul>
    </div>
  );
}

function combatantInitiativeField(combatant: Combatant) {
  const sideInitiative =
    CurrentSettings().Rules.AutoGroupInitiative ==
    AutoGroupInitiativeOption.SideInitiative;
  const initiativeBonus = sideInitiative
    ? 0
    : toModifierString(combatant.InitiativeBonus());

  let specialRollIndicator = "";
  if (!sideInitiative) {
    if (
      combatant.StatBlock().InitiativeAdvantage ||
      combatant.StatBlock().InitiativeSpecialRoll == "advantage"
    ) {
      specialRollIndicator = " [advantage]";
    }
    if (combatant.StatBlock().InitiativeSpecialRoll == "disadvantage") {
      specialRollIndicator = " [disadvantage]";
    }
    if (combatant.StatBlock().InitiativeSpecialRoll == "take-ten") {
      specialRollIndicator = " [take 10]";
    }
  }

  const className = combatant.InitiativeGroup() !== null ? "fas fa-link" : "";
  return (
    <li key={combatant.Id}>
      <span
        className={className}
      >{`${combatant.DisplayName()} (${initiativeBonus})${specialRollIndicator}: `}</span>
      <Field
        className="response"
        type="number"
        name={`initiativesById.${combatant.Id}`}
      />
    </li>
  );
}

type InitiativeModel = {
  initiativesById: {
    [combatantId: string]: number;
  };
};

export function InitiativePrompt(
  combatants: Combatant[],
  startEncounter: () => void
): PromptProps<InitiativeModel> {
  const groups = [];

  const byGroup = combatants.filter(combatant => {
    const group = combatant.InitiativeGroup();
    if (group) {
      if (groups.indexOf(group) > -1) {
        return false;
      }
      groups.push(group);
    }
    return true;
  });

  const playerCharacters = byGroup.filter(c => c.IsPlayerCharacter());
  const nonPlayerCharacters = byGroup.filter(c => !c.IsPlayerCharacter());

  const preRolledInitiatives: InitiativeModel = {
    initiativesById: _.mapValues(
      _.keyBy(byGroup, c => c.Id),
      c => c.GetInitiativeRoll()
    )
  };

  return {
    autoFocusSelector: ".response",
    children: (
      <InitiativePromptComponent
        playerCharacters={playerCharacters}
        nonPlayerCharacters={nonPlayerCharacters}
      />
    ),
    initialValues: preRolledInitiatives,
    onSubmit: model => {
      combatants.forEach(c => {
        if (model.initiativesById[c.Id] !== undefined) {
          c.Initiative(model.initiativesById[c.Id]);
        }
      });
      startEncounter();
      NotifyTutorialOfAction("CompleteInitiativeRolls");
      return true;
    }
  };
}
