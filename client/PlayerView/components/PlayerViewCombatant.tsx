import * as React from "react";

import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { SpentReactionIndicator } from "./SpentReactionIndicator";

interface PlayerViewCombatantProps {
  combatant: PlayerViewCombatantState;
  isActive: boolean;
  portraitColumnVisible: boolean;
  acColumnVisible: boolean;
  reactionTrackerVisible: boolean;
  colorVisible: boolean;
  areSuggestionsAllowed: boolean;
  showPortrait: (state: PlayerViewCombatantState) => void;
  suggestDamage: (combatant: PlayerViewCombatantState) => void;
  suggestTag?: (combatant: PlayerViewCombatantState) => void;
}

export class PlayerViewCombatant extends React.Component<PlayerViewCombatantProps> {
  public render() {
    const classNames = ["combatant"];
    if (this.props.isActive) {
      classNames.push("active");
    }
    if (this.props.combatant.IsPlayerCharacter) {
      classNames.push("playercharacter");
    }
    const hasColor =
      this.props.combatant.Color && this.props.combatant.Color.length > 0;
    const customProperties =
      this.props.colorVisible && hasColor
        ? ({
            "--ii-player-view-combatant-color": this.props.combatant.Color
          } as React.CSSProperties)
        : undefined;
    return (
      <li
        className={classNames.join(" ")}
        style={customProperties}
        data-ii-role="combatant"
        data-ii-state={this.props.isActive ? "active" : undefined}
        data-ii-health={this.props.combatant.HealthState}
        data-ii-kind={
          this.props.combatant.IsPlayerCharacter
            ? "player-character"
            : "non-player-character"
        }
      >
        <div className="combatant__initiative" data-ii-field="initiative">
          {this.props.combatant.Initiative}
        </div>
        {this.props.portraitColumnVisible && (
          <div className="combatant__portrait" data-ii-field="portrait">
            {this.props.combatant.ImageURL && (
              <img
                src={this.props.combatant.ImageURL}
                onClick={() => this.props.showPortrait(this.props.combatant)}
              />
            )}
          </div>
        )}
        <div className="combatant__name" data-ii-field="name">
          {this.props.colorVisible && hasColor && (
            <span
              className="combatant__color fas fa-circle"
              style={{ color: this.props.combatant.Color }}
            />
          )}
          {this.props.combatant.Name}
        </div>
        <div
          className={
            "combatant__hp combatant__hp-outer" +
            (this.props.areSuggestionsAllowed ? " show-hover" : "")
          }
          data-ii-field="hit-points"
        >
          <span
            className="combatant__hp-inner"
            style={{ color: this.props.combatant.HPColor }}
            onClick={() => this.props.suggestDamage(this.props.combatant)}
            dangerouslySetInnerHTML={{ __html: this.props.combatant.HPDisplay }}
          />
        </div>
        {this.props.acColumnVisible && (
          <div className="combatant__ac" data-ii-field="armor-class">
            {this.props.combatant.AC || ""}
          </div>
        )}
        <div className="combatant__tags" data-ii-field="tags">
          {this.props.combatant.Tags.map((tag, index) => (
            <div
              className="tag"
              data-tag={tag.Text.toLocaleLowerCase()}
              data-ii-tag={tag.Text.toLocaleLowerCase()}
              key={tag.Text + index}
            >
              {tag.Text}
            </div>
          ))}
          {this.props.suggestTag && (
            <div className="combatant__add-tag-button">
              <span
                className="fas fa-tag fa-clickable"
                title="Suggest a Tag"
                onClick={() => this.props.suggestTag(this.props.combatant)}
              />
            </div>
          )}
        </div>
        {this.props.reactionTrackerVisible &&
          this.props.combatant.ReactionsSpent > 0 && <SpentReactionIndicator />}
      </li>
    );
  }
}
