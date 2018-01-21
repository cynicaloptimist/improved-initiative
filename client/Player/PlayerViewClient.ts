import { SavedEncounter } from "../Encounter/SavedEncounter";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";

export class PlayerViewClient {
    constructor(private socket: SocketIOClient.Socket) { }
    
    public UpdateEncounter(encounterId: string, updatedEncounter: SavedEncounter<StaticCombatantViewModel>) {
        this.socket.emit("update encounter", encounterId, updatedEncounter);
    }
}