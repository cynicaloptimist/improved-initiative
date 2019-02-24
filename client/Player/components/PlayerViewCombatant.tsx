import * as React from "react";

import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";

interface PlayerViewCombatantProps {
  combatant: PlayerViewCombatantState;
  isActive: boolean;
  portraitColumnVisible: boolean;
  areSuggestionsAllowed: boolean;
  showPortrait: (state: PlayerViewCombatantState) => void;
  suggestDamage: (combatant: PlayerViewCombatantState) => void;
}

export class PlayerViewCombatant extends React.Component<
  PlayerViewCombatantProps
> {
  public render() {
    const classNames = ["combatant"];
    if (this.props.isActive) {
      classNames.push("active");
    }
    if (this.props.combatant.IsPlayerCharacter) {
      classNames.push("playercharacter");
    }
    return (
      <li className={classNames.join(" ")}>
        <div className="combatant__initiative">
          {this.props.combatant.Initiative}
        </div>
        {this.props.portraitColumnVisible && (
          <div className="combatant__portrait">
            {this.props.combatant.ImageURL && (
              <img
                src={this.props.combatant.ImageURL}
                onClick={() => this.props.showPortrait(this.props.combatant)}
              />
            )}
          </div>
        )}
        <div className="combatant__name" title={this.props.combatant.Name}>
          {this.props.combatant.Name}
        </div>
        <div
          className={
            "combatant__hp" +
            (this.props.areSuggestionsAllowed ? " show-hover" : "")
          }
        >
          <span
            className="current-hp"
            style={{ color: this.props.combatant.HPColor }}
            onClick={() => this.props.suggestDamage(this.props.combatant)}
            dangerouslySetInnerHTML={{ __html: this.props.combatant.HPDisplay }}
          />
        </div>
        <div className="combatant__tags">
          {this.props.combatant.Tags.map((tag, index) => (
            <div className="tag" key={tag.Text + index}>
              {tag.Text}
            </div>
          ))}
        </div>
      </li>
    );
  }
}
