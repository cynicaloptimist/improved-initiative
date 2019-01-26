import * as React from "react";

import { EncounterState } from "../../common/EncounterState";

import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";

export class PlayerView extends React.Component<PlayerViewProps> {
  public render() {
    return this.props.encounterState.Combatants.map(combatant => (
      <span key={combatant.Id}>{combatant.Name}</span>
    ));
  }
}
interface PlayerViewProps {
  encounterState: EncounterState<StaticCombatantViewModel>;
  playerViewSettings: PlayerViewSettings;
}
