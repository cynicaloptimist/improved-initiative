import * as React from "react";
import { Conditions2025 } from "../Rules/Conditions";
import * as _ from "lodash";

import { PromptProps } from "./PendingPrompts";

export function ConditionReferencePrompt(
  conditionName: string
): PromptProps<object> | null {
  const casedConditionName = _.startCase(conditionName);
  const conditionReference = Conditions2025[casedConditionName];
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
              __html: Conditions2025[casedConditionName]
            }}
          />
        </div>
      </div>
    ),
    autoFocusSelector: "button",
    initialValues: {},
    onSubmit: () => true
  };
}
