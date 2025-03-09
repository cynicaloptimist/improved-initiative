import { Socket } from "socket.io-client";
import { CombatStats } from "../../common/CombatStats";
import { EncounterState } from "../../common/EncounterState";
import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import _ = require("lodash");

export class PlayerViewClient {
  constructor(private socket: Socket) {}

  public DisplayCombatStats(encounterId: string, stats: CombatStats) {
    this.socket.emit("combat stats", encounterId, stats);
  }

  public JoinEncounter(encounterId: string): any {
    this.socket.emit("join encounter", encounterId);
  }

  public RequestCustomEncounterId = (requestedId: string) =>
    new Promise<boolean>(done => {
      this.socket.emit("request custom id", requestedId, done);
    });

  public UpdateEncounter = _.debounce(
    (
      encounterId: string,
      updatedEncounter: EncounterState<PlayerViewCombatantState>
    ) => {
      this.socket.emit("update encounter", encounterId, updatedEncounter);
    },
    100
  );

  public UpdateSettings(
    encounterId: string,
    updatedSettings: PlayerViewSettings
  ) {
    this.socket.emit("update settings", encounterId, updatedSettings);
  }
}
