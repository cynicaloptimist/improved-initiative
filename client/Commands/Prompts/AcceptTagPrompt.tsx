import * as React from "react";
import { TagState } from "../../../common/CombatantState";
import { Combatant } from "../../Combatant/Combatant";
import { Tag } from "../../Combatant/Tag";
import { SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { Metrics } from "../../Utility/Metrics";
import { LegacyPrompt } from "./Prompt";

interface AcceptTagPromptComponentProps {
  combatantName: string;
  tagState: TagState;
  suggestor: string;
  acceptTag: () => boolean;
}

interface AcceptTagPromptComponentState {}

class AcceptTagPromptComponent extends React.Component<
  AcceptTagPromptComponentProps,
  AcceptTagPromptComponentState
> {
  public render() {
    return (
      <div className="p-accept-tag">
        <span className="p-accept-tag__label">
          Add tag "{this.props.tagState.Text}" to {this.props.combatantName}?
        </span>
        <SubmitButton faClass="times" />
        <SubmitButton beforeSubmit={this.props.acceptTag} />
      </div>
    );
  }
}

export class AcceptTagPrompt implements LegacyPrompt {
  public InputSelector = ".p-accept-tag__notes";
  public ComponentName = "reactprompt";
  public component: JSX.Element;

  constructor(
    private combatant: Combatant,
    private encounter: Encounter,
    private tagState: TagState,
    suggestor: string
  ) {
    this.component = (
      <AcceptTagPromptComponent
        combatantName={combatant.DisplayName()}
        tagState={tagState}
        suggestor={suggestor}
        acceptTag={this.acceptTag}
      />
    );
  }

  public Resolve = () => {};

  private acceptTag = () => {
    if (this.tagState.DurationCombatantId.length > 0) {
      const tag = new Tag(
        this.tagState.Text,
        this.combatant,
        this.tagState.DurationRemaining,
        this.tagState.DurationTiming,
        this.tagState.DurationCombatantId
      );

      this.encounter.EncounterFlow.AddDurationTag(tag);
      this.combatant.Tags.push(tag);
      Metrics.TrackEvent("TagAddedFromSuggestion", {
        Text: tag.Text,
        Duration: tag.DurationRemaining()
      });
    } else {
      this.combatant.Tags.push(new Tag(this.tagState.Text, this.combatant));
      Metrics.TrackEvent("TagAddedFromSuggestion", {
        Text: this.tagState.Text
      });
    }

    this.encounter.QueueEmitEncounter();
    return true;
  };
}
