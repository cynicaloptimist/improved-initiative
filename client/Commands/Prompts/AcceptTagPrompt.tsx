import * as React from "react";
import { Combatant } from "../../Combatant/Combatant";
import { Tag } from "../../Combatant/Tag";
import { Button, SubmitButton } from "../../Components/Button";
import { Prompt } from "./Prompt";

interface AcceptTagPromptComponentProps {
  combatantName: string;
  tagText: string;
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
          Add tag "{this.props.tagText}" to {this.props.combatantName}?
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
    private tagText: string,
    suggestor: string
  ) {
    this.component = (
      <AcceptTagPromptComponent
        combatantName={combatant.DisplayName()}
        tagText={tagText}
        suggestor={suggestor}
        acceptTag={this.acceptTag}
      />
    );
  }

  public Resolve = () => {};

  private acceptTag = () => {
    this.combatant.Tags.push(new Tag(this.tagText, this.combatant));
    return true;
  };
}
