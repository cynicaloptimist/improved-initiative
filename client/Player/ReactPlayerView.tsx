import * as React from "react";
import { render as renderReact } from "react-dom";

import { DefaultEncounterState } from "../../common/EncounterState";
import { PlayerView as PlayerViewState } from "../../common/PlayerView";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";
import { getDefaultSettings } from "../Settings/Settings";
import { PlayerView } from "./PlayerView";

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
