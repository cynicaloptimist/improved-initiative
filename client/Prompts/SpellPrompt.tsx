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
      <>
        <SpellDetails Spell={spell} />
        <SubmitButton />
      </>
    ),
    initialValues: {},
    className: "prompt-spell",
    onSubmit: () => true
  };
}
