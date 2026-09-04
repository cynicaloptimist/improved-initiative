import * as React from "react";
import { AutoGroupInitiativeOption } from "../../common/Settings";
import { toModifierString } from "../../common/Toolbox";
import { Combatant } from "../Combatant/Combatant";
import { Button, SubmitButton } from "../Components/Button";
import { CurrentSettings } from "../Settings/Settings";
import { NotifyTutorialOfAction } from "../Tutorial/NotifyTutorialOfAction";
import { PromptProps } from "./PendingPrompts";
import * as _ from "lodash";

import { Field, useFormikContext } from "formik";
import { InitiativeSpecialRoll } from "../../common/StatBlock";
import { AbilityCheckResult } from "../Rules/Rules";

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
      <InitiativeSide
        combatants={props.playerCharacters}
        sideLabel="PC"
        sideClassName="playercharacters"
      />
      <InitiativeSide
        combatants={props.nonPlayerCharacters}
        sideLabel="Enemy"
        sideClassName="nonplayercharacters"
      />
    </div>
  );
}

function InitiativeSide(props: {
  combatants: Combatant[];
  sideLabel: "PC" | "Enemy";
  sideClassName: string;
}) {
  const { setValues, values } = useFormikContext<InitiativeModel>();
  const [rerolledType, setRerolledType] = React.useState<null | string>(null);
  const isHexagon = props.sideLabel === "PC";
  const variantClassName = isHexagon
    ? " roll-initiative__mode-button--hexagon"
    : "";
  return (
    <div className="roll-initiative__side">
      <ul className={props.sideClassName}>
        {props.combatants.map(combatant =>
          combatantInitiativeField(
            combatant,
            values.initiativesById[combatant.Id]
          )
        )}
      </ul>
      {rerolledType ? (
        <span className="roll-initiative__did-reroll">{`Rerolled with ${rerolledType}.`}</span>
      ) : (
        <div className="roll-initiative__buttons">
          <Button
            additionalClassNames={`roll-initiative__mode-button roll-initiative__mode-button--advantage${variantClassName}`}
            fontAwesomeIcon={isHexagon ? undefined : "dice-d20"}
            text="A"
            tooltip={`Reroll ${props.sideLabel} initiative with advantage`}
            onClick={() => {
              rerollInitiative(
                props.combatants,
                "advantage",
                values,
                setValues
              );
              setRerolledType("advantage");
            }}
          />
          <Button
            additionalClassNames={`roll-initiative__mode-button roll-initiative__mode-button--disadvantage${variantClassName}`}
            fontAwesomeIcon={isHexagon ? undefined : "dice-d20"}
            text="D"
            tooltip={`Reroll ${props.sideLabel} initiative with disadvantage`}
            onClick={() => {
              rerollInitiative(
                props.combatants,
                "disadvantage",
                values,
                setValues
              );
              setRerolledType("disadvantage");
            }}
          />
        </div>
      )}
    </div>
  );
}

function combatantInitiativeField(
  combatant: Combatant,
  initiativeResult: AbilityCheckResult & { specialRoll?: InitiativeSpecialRoll }
) {
  const sideInitiative =
    CurrentSettings().Rules.AutoGroupInitiative ==
    AutoGroupInitiativeOption.SideInitiative;
  const initiativeBonus = sideInitiative
    ? ""
    : toModifierString(combatant.InitiativeBonus());

  let rollsString = `[${initiativeResult.rolls[0]}]`;
  if (initiativeResult.specialRoll == "advantage") {
    rollsString = `[${initiativeResult.rolls[0]}, ${initiativeResult.rolls[1]}]a`;
  }
  if (initiativeResult.specialRoll == "disadvantage") {
    rollsString = `[${initiativeResult.rolls[0]}, ${initiativeResult.rolls[1]}]d`;
  }
  if (initiativeResult.specialRoll == "take-ten") {
    rollsString = `[10]`;
  }

  const className = combatant.InitiativeGroup() !== null ? "fas fa-link" : "";
  return (
    <li key={combatant.Id}>
      <label>
        <span
          className={className}
        >{`${combatant.DisplayName()} (${rollsString}${initiativeBonus}): `}</span>
        <Field
          className="response"
          type="number"
          name={`initiativesById.${combatant.Id}.finalValue`}
        />
      </label>
    </li>
  );
}

function rerollInitiative(
  combatants: Combatant[],
  type: "advantage" | "disadvantage",
  initiativeModel: InitiativeModel,
  setValues: (values: InitiativeModel) => void
) {
  combatants.forEach(c => {
    if (initiativeModel.initiativesById[c.Id] !== undefined) {
      const result = initiativeModel.initiativesById[c.Id];
      const cancelAdvantage =
        (result.specialRoll == "advantage" && type == "disadvantage") ||
        (result.specialRoll == "disadvantage" && type == "advantage");
      if (cancelAdvantage) {
        result.rolls = [result.rolls[0]];
        result.finalValue = result.rolls[0] + c.InitiativeBonus();
        result.specialRoll = undefined;
      } else {
        if (result.specialRoll == "take-ten") {
          return;
        }
        const specialRollAlreadyApplied = result.specialRoll == type;
        if (specialRollAlreadyApplied) {
          return;
        }
        if (type == "advantage") {
          result.rolls = [result.rolls[0], c.GetInitiativeRoll().rolls[0]];
          result.specialRoll = "advantage";
          result.finalValue = _.max(result.rolls) + c.InitiativeBonus();
        }
        if (type == "disadvantage") {
          result.rolls = [result.rolls[0], c.GetInitiativeRoll().rolls[0]];
          result.specialRoll = "disadvantage";
          result.finalValue = _.min(result.rolls) + c.InitiativeBonus();
        }
      }
    }
  });
  setValues({ ...initiativeModel });
}

type InitiativeModel = {
  initiativesById: {
    [combatantId: string]: AbilityCheckResult & {
      specialRoll?: InitiativeSpecialRoll;
    };
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

  const sideInitiative =
    CurrentSettings().Rules.AutoGroupInitiative ==
    AutoGroupInitiativeOption.SideInitiative;
  const preRolledInitiatives: InitiativeModel = {
    initiativesById: _.mapValues(
      _.keyBy(byGroup, c => c.Id),
      c => ({
        ...c.GetInitiativeRoll(),
        specialRoll: sideInitiative
          ? undefined
          : c.StatBlock().InitiativeSpecialRoll
      })
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
          c.Initiative(model.initiativesById[c.Id].finalValue);
        }
      });
      startEncounter();
      NotifyTutorialOfAction("CompleteInitiativeRolls");
      return true;
    }
  };
}
