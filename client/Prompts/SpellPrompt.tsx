import * as React from "react";

import { Spell } from "../../common/Spell";
import { SubmitButton } from "../Components/Button";
import { SpellDetails } from "../Library/Components/SpellDetails";
import { PromptProps } from "./PendingPrompts";

export function SpellPrompt(spell: Spell): PromptProps<Record<string, never>> {
  return {
    autoFocusSelector: "button",
    children: (
      <div className="prompt-spell">
        <SpellDetails Spell={spell} />
        <SubmitButton />
      </div>
    ),
    initialValues: {},
    onSubmit: () => true
  };
}
