import { StatBlockEditorProps } from "../StatBlockEditor/StatBlockEditor";
import { SpellEditorProps } from "../StatBlockEditor/SpellEditor";

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
