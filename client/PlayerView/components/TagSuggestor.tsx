import { Formik, FormikProps } from "formik";
import * as React from "react";
import { TagState } from "../../../common/CombatantState";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { EndOfTurn, StartOfTurn } from "../../Combatant/Tag";
import { TagModel, TagPromptComponent } from "../../Prompts/TagPrompt";

export class TagSuggestor extends React.Component<TagSuggestorProps> {
  public render() {
    return (
      <Formik
        initialValues={{
          tagText: "",
          tagTimingId: this.props.activeCombatantId,
          tagTiming: StartOfTurn
        }}
        onSubmit={model => {
          this.applyTag(model);
        }}
      >
        {(props: FormikProps<any>) => (
          <form className="tag-suggestion" onSubmit={props.handleSubmit}>
            <TagPromptComponent
              targetDisplayNames={this.props.targetCombatant.Name}
              combatantNamesById={this.props.combatantNamesById}
              encounterIsActive={() => this.props.activeCombatantId != null}
            />
          </form>
        )}
      </Formik>
    );
  }

  private applyTag = (model: TagModel) => {
    if (model.tagText.length == 0) {
      return true;
    }

    if (model.tagDuration) {
      // If tag is set to expire at the end of the current combatant's turn in one round,
      // we need to add a grace round so it doesn't end immediately at the end of this turn.
      const timingKeyedCombatantIsActive =
        model.tagTimingId == this.props.activeCombatantId;
      const durationGraceRound =
        timingKeyedCombatantIsActive && model.tagTiming == EndOfTurn ? 1 : 0;

      const tagState: TagState = {
        Text: model.tagText,
        DurationCombatantId: model.tagTimingId,
        DurationRemaining: model.tagDuration + durationGraceRound,
        DurationTiming: model.tagTiming
      };

      this.props.onApply(tagState);
      return true;
    } else {
      const tagState: TagState = {
        Text: model.tagText,
        DurationCombatantId: "",
        DurationRemaining: 0,
        DurationTiming: null
      };
      this.props.onApply(tagState);
      return true;
    }
  };
}

export type ApplyTagCallback = (tagState: TagState) => void;

interface TagSuggestorProps {
  targetCombatant: PlayerViewCombatantState;
  activeCombatantId: string;
  combatantNamesById: { [combatantId: string]: string };
  onApply: ApplyTagCallback;
}
