import * as React from "react";
import { render as renderReact } from "react-dom";

import {
  DefaultEncounterState,
  EncounterState
} from "../../common/EncounterState";
import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { PlayerViewState } from "../../common/PlayerViewState";
import { getDefaultSettings } from "../Settings/Settings";
import { PlayerView } from "./components/PlayerView";

export class ReactPlayerView {
  private playerViewState: PlayerViewState = {
    encounterState: DefaultEncounterState<PlayerViewCombatantState>(),
    settings: getDefaultSettings().PlayerView
  };

  constructor(private element: Element, private encounterId: string) {}

  public async LoadEncounterFromServer() {
    const playerView: PlayerViewState = await $.ajax(
      `../playerviews/${this.encounterId}`
    );
    this.renderPlayerView(playerView);
  }

  public ConnectToSocket(socket: SocketIOClient.Socket) {
    socket.on(
      "encounter updated",
      (encounter: EncounterState<PlayerViewCombatantState>) => {
        this.renderPlayerView({
          encounterState: encounter,
          settings: this.playerViewState.settings
        });
      }
    );
    socket.on("settings updated", (settings: PlayerViewSettings) => {
      this.renderPlayerView({
        encounterState: this.playerViewState.encounterState,
        settings: settings
      });
    });

    socket.emit("join encounter", this.encounterId);
  }

  private renderPlayerView(newState: PlayerViewState) {
    this.playerViewState = newState;
    renderReact(
      <PlayerView
        encounterState={this.playerViewState.encounterState}
        settings={this.playerViewState.settings}
      />,
      this.element
    );
  }
}
