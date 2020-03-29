import * as React from "react";
import { Conditions } from "../../Rules/Conditions";
import _ = require("lodash");
import { PromptProps } from "./PendingPrompts";
import { SubmitButton } from "../../Components/Button";

export function ConditionReferencePrompt(
  conditionName: string
): PromptProps<{}> | null {
  const casedConditionName = _.startCase(conditionName);
  const conditionReference = Conditions[casedConditionName];
  if (conditionReference === undefined) {
    return null;
  }
  return {
    children: (
      <div className="p-condition-reference">
        <div>
          <h3>{casedConditionName}</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: Conditions[casedConditionName]
            }}
          />
        </div>
        <SubmitButton />
      </div>
    ),
    autoFocusSelector: "button",
    initialValues: {},
    onSubmit: () => true
  };
}
