import * as React from "react";

import { PlayerViewState } from "../../../common/PlayerViewState";
import { CustomStyles } from "./CustomStyles";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";

export class PlayerView extends React.Component<PlayerViewState> {
  public render() {
    return (
      <div className="c-player-view">
        <CustomStyles
          CustomCSS={this.props.settings.CustomCSS}
          CustomStyles={this.props.settings.CustomStyles}
        />
        <PlayerViewCombatantHeader showPortrait={this.hasImages()} />
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

  public componentWillReceiveProps(nextProps: PlayerViewState) {
    if (
      nextProps.encounterState.ActiveCombatantId !=
      this.props.encounterState.ActiveCombatantId
    ) {
      console.log("next combatant");
    }
  }

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };
}
