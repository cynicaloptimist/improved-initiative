import * as React from "react";
import { TagState } from "../../../common/CombatantState";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { EndOfTurn, StartOfTurn } from "../../Combatant/Tag";
import { TagPromptComponent } from "../../Commands/Prompts/TagPrompt";
import { SubmitButton } from "../../Components/Button";

export class TagSuggestor extends React.Component<TagSuggestorProps> {
  public render() {
    return (
      <form onSubmit={this.applyTag} className="tag-suggestion">
        <TagPromptComponent
          targetDisplayNames={this.props.targetCombatant.Name}
          activeCombatantId={this.props.activeCombatantId}
          combatantNamesById={this.props.combatantNamesById}
        />
      </form>
    );
  }

  private applyTag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target;

    const text: string = form["tag-text"].value;
    if (text.length) {
      if (form["tag-duration"] && form["tag-timing-id"]) {
        const duration = parseInt(form["tag-duration"].value);
        const timing =
          form["tag-timing"].value == "end" ? EndOfTurn : StartOfTurn;
        const timingId = form["tag-timing-id"].value;

        // If tag is set to expire at the end of the current combatant's turn in one round,
        // we need to add a grace round so it doesn't end immediately at the end of this turn.
        const timingKeyedCombatantIsActive =
          timingId == this.props.activeCombatantId;
        const durationGraceRound =
          timingKeyedCombatantIsActive && timing == EndOfTurn ? 1 : 0;

        const tagState: TagState = {
          Text: text,
          DurationCombatantId: timingId,
          DurationRemaining: duration + durationGraceRound,
          DurationTiming: timing
        };

        this.props.onApply(tagState);
      } else {
        const tagState: TagState = {
          Text: text,
          DurationCombatantId: "",
          DurationRemaining: 0,
          DurationTiming: null
        };
        this.props.onApply(tagState);
      }
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
