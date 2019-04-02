import * as React from "react";
import { TagState } from "../../../common/CombatantState";
import { Combatant } from "../../Combatant/Combatant";
import { Tag } from "../../Combatant/Tag";
import { Button, SubmitButton } from "../../Components/Button";
import { Prompt } from "./Prompt";

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

export class AcceptTagPrompt implements Prompt {
  public InputSelector = ".p-accept-tag__notes";
  public ComponentName = "reactprompt";
  public component: JSX.Element;

  constructor(
    private combatant: Combatant,
    private addDurationTagToEncounter: (tag: Tag) => void,
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

      this.addDurationTagToEncounter(tag);
      this.combatant.Tags.push(tag);
    } else {
      this.combatant.Tags.push(new Tag(this.tagState.Text, this.combatant));
    }

    return true;
  };
}
