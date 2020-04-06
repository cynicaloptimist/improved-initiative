import * as React from "react";

import { Combatant } from "../Combatant/Combatant";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";
import { SubmitButton } from "../Components/Button";

type ConcentationModel = {
  failCheck: boolean;
};

export const ConcentrationTagText = "Concentrating";

export function ConcentrationPrompt(
  combatant: Combatant,
  damageAmount: number
): PromptProps<ConcentationModel> {
  const concentrationDC = damageAmount > 20 ? Math.floor(damageAmount / 2) : 10;
  const autoRoll = combatant.GetConcentrationRoll();
  return {
    autoFocusSelector: ".pass",
    children: (
      <div className="p-concentration-prompt p-standard-prompt">
        <p className="p-standard-prompt__label">
          {combatant.DisplayName()} DC {<strong>{concentrationDC}</strong>}
          {" concentration check (Constitution save). Auto-roll: "}
          {<strong>{autoRoll}</strong>}
        </p>
        <SubmitButton
          text="Fail"
          fontAwesomeIcon="times"
          bindModel={["failCheck", true]}
        />
        <SubmitButton text="Pass" additionalClassNames="pass" />
      </div>
    ),
    initialValues: { failCheck: false },
    onSubmit: model => {
      if (!model.failCheck) {
        return true;
      }

      combatant
        .Tags()
        .filter(t => t.Text === ConcentrationTagText)
        .forEach(tag => combatant.Tags.remove(tag));
      return true;
    }
  };
}
