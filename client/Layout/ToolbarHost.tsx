import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { Command } from "../Commands/Command";
import { Toolbar } from "../Commands/Toolbar";

export function ToolbarHost(props: { tracker: TrackerViewModel }) {
  const { tracker } = props;
  const encounterState = useSubscription(tracker.Encounter.EncounterFlow.State);
  const combatantSelected = useSubscription(
    tracker.CombatantCommander.HasSelected
  );
  const oneCombatantSelected = useSubscription(
    tracker.CombatantCommander.HasOneSelected
  );
  const toolbarWide = useSubscription(tracker.ToolbarWide);

  const commandsToHideById =
    encounterState === "active"
      ? ["start-encounter"]
      : ["reroll-initiative", "end-encounter", "next-turn", "previous-turn"];

  if (!oneCombatantSelected) {
    commandsToHideById.push("update-notes");
  }

  const shouldShowCommand = (c: Command) =>
    !commandsToHideById.some(d => c.Id == d);

  return (
    <Toolbar
      encounterCommands={tracker.EncounterToolbar.filter(shouldShowCommand)}
      combatantCommands={tracker.CombatantCommander.Commands.filter(
        shouldShowCommand
      )}
      width={toolbarWide ? "wide" : "narrow"}
      showCombatantCommands={combatantSelected}
    />
  );
}
