import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { SelectedCombatants } from "./SelectedCombatants";
import { useVerticalResizerDrop } from "./useVerticalResizerDrop";

export function RightColumn(props: {
  tracker: TrackerViewModel;
  columnWidth: number;
}) {
  return (
    <div
      className="right-column"
      style={{ width: props.columnWidth, maxWidth: props.columnWidth }}
      ref={useVerticalResizerDrop()}
    >
      <SelectedCombatants
        combatantCommander={props.tracker.CombatantCommander}
      />
    </div>
  );
}
