import * as React from "react";
import { render as renderReact } from "react-dom";

import { TagState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { PlayerViewState } from "../../common/PlayerViewState";
import { getDefaultSettings } from "../../common/Settings";
import { PlayerView } from "./components/PlayerView";

export class ReactPlayerView {
  private playerViewState: PlayerViewState;
  private socket: SocketIOClient.Socket;

  constructor(private element: Element, private encounterId: string) {
    this.renderPlayerView({
      encounterState: EncounterState.Default<PlayerViewCombatantState>(),
      settings: getDefaultSettings().PlayerView
    });
  }

  public async LoadEncounterFromServer() {
    try {
      const playerView: PlayerViewState = await $.ajax(
        `../playerviews/${this.encounterId}`
      );
      this.renderPlayerView(playerView);
    } catch (e) {}
  }

  public ConnectToSocket(socket: SocketIOClient.Socket) {
    this.socket = socket;
    this.socket.on(
      "encounter updated",
      (encounter: EncounterState<PlayerViewCombatantState>) => {
        this.renderPlayerView({
          encounterState: encounter,
          settings: this.playerViewState.settings
        });
      }
    );
    this.socket.on("settings updated", (settings: PlayerViewSettings) => {
      this.renderPlayerView({
        encounterState: this.playerViewState.encounterState,
        settings: settings
      });
    });

    this.socket.emit("join encounter", this.encounterId);
  }

  private renderPlayerView(newState: PlayerViewState) {
    this.playerViewState = newState;
    renderReact(
      <PlayerView
        encounterState={this.playerViewState.encounterState}
        settings={this.playerViewState.settings}
        onSuggestDamage={this.suggestDamage}
        onSuggestTag={this.suggestTag}
      />,
      this.element
    );
  }

  private suggestDamage = (combatantId: string, damageAmount: number) => {
    if (!this.socket) {
      throw "Player View not attached to socket";
    }
    this.socket.emit(
      "suggest damage",
      this.encounterId,
      [combatantId],
      damageAmount,
      "Player"
    );
  };

  private suggestTag = (combatantId: string, tagState: TagState) => {
    if (!this.socket) {
      throw "Player View not attached to socket";
    }
    this.socket.emit(
      "suggest tag",
      this.encounterId,
      [combatantId],
      tagState,
      "Player"
    );
  };
}
