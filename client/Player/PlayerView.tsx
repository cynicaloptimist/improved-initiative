import * as React from "react";

import { PlayerViewState } from "../../common/PlayerViewState";

export class PlayerView extends React.Component<PlayerViewState> {
  public render() {
    return this.props.encounterState.Combatants.map(combatant => (
      <span key={combatant.Id}>{combatant.Name}</span>
    ));
  }
}
