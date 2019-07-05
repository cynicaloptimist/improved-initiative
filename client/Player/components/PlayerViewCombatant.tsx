import * as React from "react";

import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";

interface PlayerViewCombatantProps {
  combatant: PlayerViewCombatantState;
  isActive: boolean;
  portraitColumnVisible: boolean;
  acColumnVisible: boolean;
  areSuggestionsAllowed: boolean;
  showPortrait: (state: PlayerViewCombatantState) => void;
  suggestDamage: (combatant: PlayerViewCombatantState) => void;
  suggestTag?: (combatant: PlayerViewCombatantState) => void;
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
        {this.props.acColumnVisible && (
          <div className="combatant__ac">{this.props.combatant.AC || ""}</div>
        )}
        <div className="combatant__tags">
          {this.props.combatant.Tags.map((tag, index) => (
            <div className="tag" key={tag.Text + index}>
              {tag.Text}
            </div>
          ))}
        </div>
        {this.props.suggestTag && (
          <div className="combatant__add-tag-button">
            <span
              className="fas fa-tag fa-clickable"
              title="Suggest a Tag"
              onClick={() => this.props.suggestTag(this.props.combatant)}
            />
          </div>
        )}
      </li>
    );
  }
}
