import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { InitiativeList } from "./InitiativeList";
import { CommandContext } from "./CommandContext";
import { useCallback } from "react";
import { TagState } from "../../common/CombatantState";

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

  const selectCombatantById = useCallback(
    (combatantId: string, appendSelection: boolean) => {
      const selectedViewModel = tracker
        .CombatantViewModels()
        .find(c => c.Combatant.Id == combatantId);

      if (selectedViewModel !== undefined) {
        tracker.CombatantCommander.Select(selectedViewModel, appendSelection);
      }
    },
    [tracker]
  );

  const removeCombatantTag = useCallback(
    (combatantId: string, tagState: TagState) => {
      const combatantViewModel = tracker
        .CombatantViewModels()
        .find(c => c.Combatant.Id == combatantId);
      combatantViewModel?.RemoveTagByState(tagState);
    },
    [tracker]
  );

  const applyDamageToCombatant = useCallback(
    (combatantId: string) => {
      const combatantViewModel = tracker
        .CombatantViewModels()
        .find(c => c.Combatant.Id == combatantId);

      if (combatantViewModel !== undefined) {
        tracker.CombatantCommander.ApplyDamageTargeted(combatantViewModel);
      }
    },
    [tracker]
  );

  const moveCombatantFromDrag = useCallback(
    (draggedCombatantId: string, droppedOntoCombatantId: string | null) => {
      const combatants = tracker.Encounter.Combatants();
      if (!combatants) {
        return;
      }
      const draggedCombatant = combatants.find(c => c.Id == draggedCombatantId);
      const droppedCombatantIndex =
        droppedOntoCombatantId === null
          ? combatants.length
          : combatants.findIndex(c => c.Id == droppedOntoCombatantId);
      tracker.Encounter.MoveCombatant(draggedCombatant, droppedCombatantIndex);
    },
    [tracker]
  );

  const setCombatantColor = useCallback(
    (combatantId: string, color: string) => {
      const combatant = tracker.Encounter.Combatants().find(
        c => c.Id == combatantId
      );
      combatant.Color(color);
    },
    [tracker]
  );

  const toggleCombatantSpentReaction = useCallback(
    (combatantId: string) => {
      const combatantViewModel = tracker
        .CombatantViewModels()
        .find(c => c.Combatant.Id == combatantId);
      combatantViewModel.ToggleSpentReaction();
    },
    [tracker]
  );

  return (
    <CommandContext.Provider
      value={{
        SelectCombatant: selectCombatantById,
        RemoveTagFromCombatant: removeCombatantTag,
        ApplyDamageToCombatant: applyDamageToCombatant,
        CombatantCommands: tracker.CombatantCommander.Commands,
        MoveCombatantFromDrag: moveCombatantFromDrag,
        SetCombatantColor: setCombatantColor,
        ToggleCombatantSpentReaction: toggleCombatantSpentReaction
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
