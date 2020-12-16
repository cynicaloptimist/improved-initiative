import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import {
  StatBlockEditor,
  StatBlockEditorProps
} from "../StatBlockEditor/StatBlockEditor";
import { SpellEditor, SpellEditorProps } from "../StatBlockEditor/SpellEditor";
import { PendingPrompts } from "../Prompts/PendingPrompts";
import { CombatFooter } from "../CombatFooter/CombatFooter";
import { InitiativeListHost } from "./InitiativeListHost";
import { useVerticalResizerDrop } from "./useVerticalResizerDrop";

export function CenterColumn(props: { tracker: TrackerViewModel }) {
  const statblockEditorProps = useSubscription(
    props.tracker.StatBlockEditorProps
  );
  const spellEditorProps = useSubscription(props.tracker.SpellEditorProps);
  const prompts = useSubscription(props.tracker.PromptQueue.GetPrompts);
  const centerColumn = centerColumnView(statblockEditorProps, spellEditorProps);

  return (
    <div className="center-column" ref={useVerticalResizerDrop()}>
      {centerColumn === "statblockeditor" && (
        <StatBlockEditor {...statblockEditorProps} />
      )}
      {centerColumn === "spelleditor" && <SpellEditor {...spellEditorProps} />}
      {centerColumn === "combat" && (
        <>
          <InitiativeListHost tracker={props.tracker} />
          <PendingPrompts
            promptsAndIds={prompts}
            removePrompt={props.tracker.PromptQueue.Remove}
          />
        </>
      )}
      <CombatFooter
        encounter={props.tracker.Encounter}
        eventLog={props.tracker.EventLog}
      />
    </div>
  );
}
export function centerColumnView(
  statBlockEditorProps: StatBlockEditorProps,
  spellEditorProps: SpellEditorProps
) {
  if (statBlockEditorProps !== null) {
    return "statblockeditor";
  }
  if (spellEditorProps !== null) {
    return "spelleditor";
  }
  return "combat";
}
export function interfacePriorityClass(
  centerColumnView: string,
  librariesVisible: boolean,
  hasPrompt: boolean,
  isACombatantSelected: boolean,
  encounterState: "active" | "inactive"
) {
  if (
    centerColumnView === "statblockeditor" ||
    centerColumnView === "spelleditor"
  ) {
    if (librariesVisible) {
      return "show-center-left-right";
    }
    return "show-center-right-left";
  }

  if (librariesVisible) {
    return "show-left-center-right";
  }

  if (hasPrompt) {
    if (isACombatantSelected) {
      return "show-center-right-left";
    }
    return "show-center-left-right";
  }

  if (isACombatantSelected) {
    return "show-right-center-left";
  }

  if (encounterState == "active") {
    return "show-center-left-right";
  }

  return "show-center-right-left";
}
