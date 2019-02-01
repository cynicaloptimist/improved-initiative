import * as React from "react";

import { PlayerViewState } from "../../../common/PlayerViewState";
import { PlayerViewCombatant } from "./PlayerViewCombatant";

export class PlayerView extends React.Component<PlayerViewState> {
  public render() {
    return (
      <div className="c-player-view">
        <div className="combatant--header">
          <div className="combatant__initiative">
            <span className="fas fa-forward" />
          </div>
          <div className="combatant__portrait" data-bind="visible: hasImages" />
          <div className="combatant__name">Combatant</div>
          <div className="combatant__hp">
            <span className="fas fa-heart" />
          </div>
          <div className="combatant__tags">
            <span className="fas fa-tag" />
          </div>
        </div>
        <ul className="combatants">
          {this.props.encounterState.Combatants.map(combatant => (
            <PlayerViewCombatant
              combatant={combatant}
              areSuggestionsAllowed={this.props.settings.AllowPlayerSuggestions}
              isPortraitVisible={this.props.settings.DisplayPortraits}
              isActive={
                this.props.encounterState.ActiveCombatantId == combatant.Id
              }
              key={combatant.Id}
            />
          ))}
        </ul>
      </div>
    );
  }
}
