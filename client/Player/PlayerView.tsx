import * as React from "react";

import { PlayerViewState } from "../../common/PlayerViewState";

export class PlayerView extends React.Component<PlayerViewProps> {
  public render() {
    return this.props.state.encounterState.Combatants.map(combatant => (
      <span key={combatant.Id}>{combatant.Name}</span>
    ));
  }
}
interface PlayerViewProps {
  state: PlayerViewState;
}
