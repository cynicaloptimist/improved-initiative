import * as React from "react";
import { TrackerViewModel } from "./TrackerViewModel";
import { useSubscription } from "./Combatant/linkComponentToObservables";
import { InitiativeList } from "./InitiativeList/InitiativeList";
import { CommandContext } from "./InitiativeList/CommandContext";
import { useCallback } from "react";
import { TagState } from "../common/CombatantState";

export function InitiativeListHost(props: { tracker: TrackerViewModel }) {
  const { tracker } = props;

  const encounterState = useSubscription(
    tracker.Encounter.ObservableEncounterState
  );
  const selectedCombatantIds = useSubscription(
    tracker.CombatantCommander.SelectedCombatants
  ).map(c => c.Combatant.Id);
  const combatantCountsByName = useSubscription(
    tracker.Encounter.CombatantCountsByName
  );
  const combatantViewModels = useSubscription(tracker.CombatantViewModels);

  const selectCombatantById = useCallback(
    (combatantId: string, appendSelection: boolean) => {
      const selectedViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );

      if (selectedViewModel !== undefined) {
        tracker.CombatantCommander.Select(selectedViewModel, appendSelection);
      }
    },
    [tracker, combatantViewModels]
  );

  const removeCombatantTag = useCallback(
    (combatantId: string, tagState: TagState) => {
      const combatantViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );
      combatantViewModel?.RemoveTagByState(tagState);
    },
    [tracker, combatantViewModels]
  );

  const applyDamageToCombatant = useCallback(
    (combatantId: string) => {
      const combatantViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );

      if (combatantViewModel !== undefined) {
        tracker.CombatantCommander.EditSingleCombatantHP(combatantViewModel);
      }
    },
    [tracker, combatantViewModels]
  );

  return (
    <CommandContext.Provider
      value={{
        SelectCombatant: selectCombatantById,
        RemoveTagFromCombatant: removeCombatantTag,
        ApplyDamageToCombatant: applyDamageToCombatant,
        CombatantCommands: tracker.CombatantCommander.Commands
      }}
    >
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={selectedCombatantIds}
        combatantCountsByName={combatantCountsByName}
      />
    </CommandContext.Provider>
  );
}
