import { EncounterState } from "../../common/EncounterState";
import { PlayerViewSettings } from "../../common/PlayerViewSettings";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";

export class PlayerViewClient {
    constructor(private socket: SocketIOClient.Socket) { }

    public JoinEncounter(encounterId: string): any {
        this.socket.emit("join encounter", encounterId);
    }

    public UpdateEncounter(encounterId: string, updatedEncounter: EncounterState<StaticCombatantViewModel>) {
        this.socket.emit("update encounter", encounterId, updatedEncounter);
    }

    public UpdateSettings(encounterId: string, updatedSettings: PlayerViewSettings) {
        this.socket.emit("update settings", encounterId, updatedSettings);
    }
}