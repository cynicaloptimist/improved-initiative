import * as React from "react";

/**
 * Represents a single rolled die on the roll result prompt
 */
export const RolledDieChip = ({
  value,
  max,
  isKept,
  isDiscarded
}: {
  value: number;
  max: number;
  isKept: boolean;
  isDiscarded: boolean;
}) => {
  const classNames = ["p-roll-dice-result__roll"];
  if (value === 1) {
    classNames.push("p-roll-dice-result__roll--min");
  }
  if (value === max) {
    classNames.push("p-roll-dice-result__roll--max");
  }
  if (isKept) {
    classNames.push("p-roll-dice-result__roll--kept");
  }
  if (isDiscarded) {
    classNames.push("p-roll-dice-result__roll--discarded");
  }

  return <span className={classNames.join(" ")}>{value}</span>;
};
