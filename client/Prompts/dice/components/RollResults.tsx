import * as React from "react";
import { DiceRoll, RollMode, RollModes } from "../../../Rules/Dice";
import { Button } from "../../../Components/Button";
import { RolledDieChip } from "./DieChip";

const getModeLabel = (mode?: RollMode) => {
  if (mode === undefined) {
    return "";
  }
  return mode === RollModes.Advantage ? "advantage" : "disadvantage";
};

const getFullRollLabel = (roll: DiceRoll) => {
  let label = `${roll.DiceCount}d${roll.DieSize}${roll.ModifierText}`;
  const modeLabel = getModeLabel(roll.Mode);
  if (modeLabel) {
    label += ` with ${modeLabel}`;
  }
  return `Rolled ${label}`;
};

const getRerollTooltip = (mode: RollMode) => {
  const modeLabel = getModeLabel(mode);
  return modeLabel ? `Reroll with ${modeLabel}` : "Reroll";
};

/**
 * Renders the results of the roll and its controls
 */
export const RollResultComponent = ({
  initialRoll,
  handleReroll
}: {
  initialRoll: DiceRoll;
  handleReroll: (roll: DiceRoll) => void;
}) => {
  const [roll, setRoll] = React.useState(initialRoll);
  const rerollTooltip = getRerollTooltip(roll.Mode);

  const updateRoll = (roll: DiceRoll) => {
    setRoll(roll);
    handleReroll(roll);
  };

  const resultClassNames = ["p-roll-dice-result"];
  if (roll.Mode === RollModes.Advantage) {
    resultClassNames.push("p-roll-dice-result--advantage");
  }

  return (
    <div className={resultClassNames.join(" ")}>
      <div className="p-roll-dice-result__total">{roll.Total}</div>
      <div className="p-roll-dice-result__details">
        <span className="p-roll-dice-result__expression">
          {getFullRollLabel(roll)}
        </span>
        <span className="p-roll-dice-result__rolls">
          {roll.Results.map((number, index) => (
            <RolledDieChip
              value={number}
              max={roll.DieSize}
              isKept={
                roll.ChosenIndex !== undefined && index === roll.ChosenIndex
              }
              isDiscarded={
                roll.ChosenIndex !== undefined && index !== roll.ChosenIndex
              }
              key={index}
            />
          ))}
          <span className="p-roll-dice-result__calculation">
            {`${roll.ModifierText} = ${roll.Total}`.trim()}
          </span>
        </span>
      </div>
      <div className="p-roll-dice-result__actions">
        {roll.CanSelectMode() && (
          <>
            <Button
              additionalClassNames="c-roll-mode-button c-roll-mode-button--advantage"
              ariaLabel="Add advantage"
              fontAwesomeIcon="dice-d20"
              onClick={() => updateRoll(roll.WithMode(RollModes.Advantage))}
              text="A"
              tooltip="Add advantage"
            />
            <Button
              additionalClassNames="c-roll-mode-button c-roll-mode-button--disadvantage"
              ariaLabel="Add disadvantage"
              fontAwesomeIcon="dice-d20"
              onClick={() => updateRoll(roll.WithMode(RollModes.Disadvantage))}
              text="D"
              tooltip="Add disadvantage"
            />
          </>
        )}
        <Button
          additionalClassNames="p-roll-dice-result__reroll"
          ariaLabel={rerollTooltip}
          fontAwesomeIcon="sync"
          onClick={() => updateRoll(roll.Reroll())}
          tooltip={rerollTooltip}
        />
      </div>
    </div>
  );
};
