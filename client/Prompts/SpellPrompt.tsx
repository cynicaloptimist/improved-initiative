import * as React from "react";

import { Spell } from "../../common/Spell";
import { SubmitButton } from "../Components/Button";
import { SpellDetails } from "../Library/Components/SpellDetails";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { PromptProps } from "./PendingPrompts";

export function SpellPrompt(
  spell: Spell,
  textEnricher: TextEnricher
): PromptProps<{}> {
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
