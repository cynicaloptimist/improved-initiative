import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { LibraryPanes } from "../Library/Components/LibraryPanes";
import { find } from "lodash";
import { CombatantDetails } from "../Combatant/CombatantDetails";
import { useVerticalResizerDrop } from "./useVerticalResizerDrop";

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
        <LibraryPanes
          librariesCommander={props.tracker.LibrariesCommander}
          libraries={props.tracker.Libraries}
          statBlockTextEnricher={props.tracker.StatBlockTextEnricher}
        />
      )}
      {librariesVisible || (
        <div className="active-combatant">
          <div className="combatant-details__header">
            <h2>Active Combatant</h2>
          </div>
          {activeCombatantViewModel && (
            <CombatantDetails
              combatantViewModel={activeCombatantViewModel}
              displayMode="active"
              key={activeCombatantViewModel.Combatant.Id}
            />
          )}
          {!activeCombatant && (
            <p className="start-encounter-hint">
              Click [<span className="fas fa-play" /> Start Encounter ] to roll
              initiative. The StatBlock for the Active Combatant will be
              displayed here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
