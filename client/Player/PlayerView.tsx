import * as React from "react";
import { render as renderReact } from "react-dom";

import {
  DefaultEncounterState,
  EncounterState
} from "../../common/EncounterState";
import { PlayerView as PlayerViewState } from "../../common/PlayerView";

import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";
import { getDefaultSettings } from "../Settings/Settings";

interface PlayerViewProps {
  encounterState: EncounterState<StaticCombatantViewModel>;
  playerViewSettings: PlayerViewSettings;
}

class PlayerView extends React.Component<PlayerViewProps> {
  public render() {
    return this.props.encounterState.Combatants.map(combatant => (
      <span key={combatant.Id}>{combatant.Name}</span>
    ));
  }
}

export class ReactPlayerView {
  constructor(private element: Element) {
    const emptyState = DefaultEncounterState<StaticCombatantViewModel>();
    const settings = getDefaultSettings().PlayerView;
    renderReact(
      <PlayerView encounterState={emptyState} playerViewSettings={settings} />,
      this.element
    );
  }

  public async LoadEncounterFromServer(encounterId: string) {
    const playerView: PlayerViewState = await $.ajax(
      `../playerviews/${encounterId}`
    );
    renderReact(
      <PlayerView
        encounterState={playerView.encounterState}
        playerViewSettings={playerView.settings}
      />,
      this.element
    );
  }
}
