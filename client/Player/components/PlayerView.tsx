import * as React from "react";

import { PlayerViewState } from "../../../common/PlayerViewState";
import { PlayerViewCombatant } from "./PlayerViewCombatant";

export class PlayerView extends React.Component<PlayerViewState> {
  public render() {
    return this.props.encounterState.Combatants.map(combatant => (
      <PlayerViewCombatant
        combatant={combatant}
        areSuggestionsAllowed={this.props.settings.AllowPlayerSuggestions}
        isPortraitVisible={this.props.settings.DisplayPortraits}
        isActive={this.props.encounterState.ActiveCombatantId == combatant.Id}
        key={combatant.Id}
      />
    ));
  }
}
