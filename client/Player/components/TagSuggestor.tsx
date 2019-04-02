import * as React from "react";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { SubmitButton } from "../../Components/Button";

export class TagSuggestor extends React.Component<TagSuggestorProps> {
  private inputElement: HTMLInputElement;

  public componentDidMount = () => {
    this.inputElement.focus();
  };

  public render() {
    return (
      <form onSubmit={this.applyTag} className="tag-suggestion">
        <span>Apply tag to {this.props.combatant.Name}</span>
        <input type="text" ref={e => (this.inputElement = e)} />
        <SubmitButton />
      </form>
    );
  }

  private applyTag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.onApply(this.props.combatant.Id, this.inputElement.value);
  };
}

export type ApplyTagCallback = (combatantId: string, tagText: string) => void;

interface TagSuggestorProps {
  combatant: PlayerViewCombatantState;
  onApply: ApplyTagCallback;
}
