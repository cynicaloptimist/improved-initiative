import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { LibraryReferencePanes } from "../Library/ReferencePane/LibraryReferencePanes";
import { find } from "lodash";
import { CombatantDetails } from "../Combatant/CombatantDetails";
import { useVerticalResizerDrop } from "./VerticalResizer";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";

export function LeftColumn(props: {
  tracker: TrackerViewModel;
  columnWidth: number;
}) {
  const librariesVisible = useSubscription(props.tracker.LibrariesVisible);

  const combatantViewModels = useSubscription(
    props.tracker.CombatantViewModels
  );
  const activeCombatant = useSubscription(
    props.tracker.Encounter.EncounterFlow.ActiveCombatant
  );

  const activeCombatantViewModel = find(
    combatantViewModels,
    c => c.Combatant == activeCombatant
  );

  return (
    <div
      className="left-column"
      style={{ width: props.columnWidth, maxWidth: props.columnWidth }}
      ref={useVerticalResizerDrop()}
    >
      {librariesVisible && (
        <LibraryReferencePanes
          librariesCommander={props.tracker.LibrariesCommander}
          libraries={props.tracker.Libraries}
        />
      )}
      {librariesVisible || (
        <ActiveCombatant activeCombatantViewModel={activeCombatantViewModel} />
      )}
    </div>
  );
}

function ActiveCombatant(props: {
  activeCombatantViewModel: CombatantViewModel;
}) {
  return (
    <div className="active-combatant">
      <div className="combatant-details__header">
        <h2>Active Combatant</h2>
      </div>
      {props.activeCombatantViewModel && (
        <CombatantDetails
          combatantViewModel={props.activeCombatantViewModel}
          displayMode="active"
          key={props.activeCombatantViewModel.Combatant.Id}
        />
      )}
      {!props.activeCombatantViewModel && (
        <p className="start-encounter-hint">
          Click [<span className="fas fa-play" /> Start Encounter ] to roll
          initiative. The StatBlock for the Active Combatant will be displayed
          here.
        </p>
      )}
    </div>
  );
}
