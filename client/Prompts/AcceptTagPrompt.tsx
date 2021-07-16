import * as React from "react";
import { TagState } from "../../common/CombatantState";
import { Combatant } from "../Combatant/Combatant";
import { Tag } from "../Combatant/Tag";
import { SubmitButton } from "../Components/Button";
import { Encounter } from "../Encounter/Encounter";
import { Metrics } from "../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import { StandardPromptLayout } from "./StandardPromptLayout";

type AcceptTagModel = {
  accept: boolean;
};

export function AcceptTagPrompt(
  combatant: Combatant,
  encounter: Encounter,
  tagState: TagState
): PromptProps<AcceptTagModel> {
  return {
    autoFocusSelector: ".accept",
    children: (
      <StandardPromptLayout
        label={`Add tag "${tagState.Text}" to ${combatant.DisplayName()}?`}
        fieldsDoSubmit
      >
        <SubmitButton fontAwesomeIcon="times" />
        <SubmitButton
          additionalClassNames="accept"
          submitIntent={["accept", true]}
        />
      </StandardPromptLayout>
    ),
    initialValues: { accept: false },
    onSubmit: model => {
      if (!model.accept) {
        return true;
      }

      if (tagState.DurationCombatantId.length > 0) {
        const tag = new Tag(
          tagState.Text,
          combatant,
          false,
          tagState.DurationRemaining,
          tagState.DurationTiming,
          tagState.DurationCombatantId
        );

        encounter.EncounterFlow.AddDurationTag(tag);
        combatant.Tags.push(tag);
        Metrics.TrackEvent("TagAddedFromSuggestion", {
          Text: tag.Text,
          Duration: tag.DurationRemaining()
        });
      } else {
        combatant.Tags.push(new Tag(tagState.Text, combatant, false));
        Metrics.TrackEvent("TagAddedFromSuggestion", {
          Text: tagState.Text
        });
      }

      return true;
    }
  };
}
