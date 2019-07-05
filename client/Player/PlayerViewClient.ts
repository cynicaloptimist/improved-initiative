import { EncounterState } from "../../common/EncounterState";
import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";

export class PlayerViewClient {
  constructor(private socket: SocketIOClient.Socket) {}

  public JoinEncounter(encounterId: string): any {
    this.socket.emit("join encounter", encounterId);
    window.setInterval(() => this.socket.emit("heartbeat", encounterId), 10000);
  }

  public UpdateEncounter(
    encounterId: string,
    updatedEncounter: EncounterState<PlayerViewCombatantState>
  ) {
    this.socket.emit("update encounter", encounterId, updatedEncounter);
  }

  public UpdateSettings(
    encounterId: string,
    updatedSettings: PlayerViewSettings
  ) {
    this.socket.emit("update settings", encounterId, updatedSettings);
  }
}
