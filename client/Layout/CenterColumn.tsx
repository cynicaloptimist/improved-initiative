import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { StatBlockEditor } from "../StatBlockEditor/StatBlockEditor";
import { SpellEditor } from "../StatBlockEditor/SpellEditor";
import { PendingPrompts } from "../Prompts/PendingPrompts";
import { CombatFooter } from "../CombatFooter/CombatFooter";
import { InitiativeListHost } from "../InitiativeList/InitiativeListHost";
import { useVerticalResizerDrop } from "./VerticalResizer";
import { centerColumnView } from "./centerColumnView";

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
