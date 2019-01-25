import * as React from "react";
import { render as renderReact } from "react-dom";

import {
  DefaultEncounterState,
  EncounterState
} from "../../common/EncounterState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";
import { getDefaultSettings } from "../Settings/Settings";

interface PlayerViewProps {
  encounterState: EncounterState<StaticCombatantViewModel>;
  playerViewSettings: PlayerViewSettings;
}
interface PlayerViewState {}

class PlayerView extends React.Component<PlayerViewProps, PlayerViewState> {
  public render() {
    return this.props.encounterState.Combatants.map(combatant => (
      <span key={combatant.Id}>{combatant.Name}</span>
    ));
  }
}

export class ReactPlayerView {
  constructor(element: Element) {
    const emptyState = DefaultEncounterState<StaticCombatantViewModel>();
    emptyState.Combatants.push({
      Name: "Test",
      HPColor: "",
      HPDisplay: "",
      Id: "",
      ImageURL: "",
      Initiative: 0,
      IsPlayerCharacter: false,
      Tags: []
    });
    const settings = getDefaultSettings().PlayerView;
    renderReact(
      <PlayerView encounterState={emptyState} playerViewSettings={settings} />,
      element
    );
  }
}
