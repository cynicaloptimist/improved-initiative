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
  const actionClassNames = ["p-roll-dice-result__actions"];
  // if (roll.CanSelectMode()) {
  // actionClassNames.push("p-roll-dice-result__actions--comparison");
  // }

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
      <div className={actionClassNames.join(" ")}>
        {roll.CanSelectMode() && (
          <>
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-letter p-roll-dice-result__mode-advantage"
              ariaLabel="Add advantage"
              fontAwesomeIcon="dice-d20"
              onClick={() => updateRoll(roll.WithMode(RollModes.Advantage))}
              text="A"
              tooltip="Add advantage"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-letter p-roll-dice-result__mode-disadvantage"
              ariaLabel="Add disadvantage"
              fontAwesomeIcon="dice-d20"
              onClick={() => updateRoll(roll.WithMode(RollModes.Disadvantage))}
              text="D"
              tooltip="Add disadvantage"
            />
            {/*<Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-letter"
              ariaLabel="Roll with advantage — neutral d20 background"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("advantage")}
              text="A"
              tooltip="Add advantage — neutral d20 background"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-letter"
              ariaLabel="Roll with disadvantage — neutral d20 background"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("disadvantage")}
              text="D"
              tooltip="Add disadvantage — neutral d20 background"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-abbreviation p-roll-dice-result__mode-advantage"
              ariaLabel="Roll with advantage — d20 abbreviation"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("advantage")}
              text="ADV"
              tooltip="Add advantage — d20 abbreviation"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-d20-background-abbreviation p-roll-dice-result__mode-disadvantage"
              ariaLabel="Roll with disadvantage — d20 abbreviation"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("disadvantage")}
              text="DIS"
              tooltip="Add disadvantage — d20 abbreviation"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-advantage"
              ariaLabel="Roll with advantage — d20 plus"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("advantage")}
              text="+"
              tooltip="Add advantage — d20 plus"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-d20-background p-roll-dice-result__mode-disadvantage"
              ariaLabel="Roll with disadvantage — d20 minus"
              fontAwesomeIcon="dice-d20"
              onClick={() => selectMode("disadvantage")}
              text="−"
              tooltip="Add disadvantage — d20 minus"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-hexagon p-roll-dice-result__mode-hexagon-advantage"
              ariaLabel="Roll with advantage — hexagon plus"
              fontAwesomeIcon="plus"
              onClick={() => selectMode("advantage")}
              tooltip="Add advantage — hexagon plus"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-hexagon p-roll-dice-result__mode-hexagon-disadvantage"
              ariaLabel="Roll with disadvantage — hexagon minus"
              fontAwesomeIcon="minus"
              onClick={() => selectMode("disadvantage")}
              tooltip="Add disadvantage — hexagon minus"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-hexagon p-roll-dice-result__mode-hexagon-advantage"
              ariaLabel="Roll with advantage — hexagon letter"
              onClick={() => selectMode("advantage")}
              text="A"
              tooltip="Add advantage — hexagon letter"
            />
            <Button
              additionalClassNames="p-roll-dice-result__mode-hexagon p-roll-dice-result__mode-hexagon-disadvantage"
              ariaLabel="Roll with disadvantage — hexagon letter"
              onClick={() => selectMode("disadvantage")}
              text="D"
              tooltip="Add disadvantage — hexagon letter"
            />*/}
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
