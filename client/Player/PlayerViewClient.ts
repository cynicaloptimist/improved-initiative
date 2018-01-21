import { SavedEncounter } from "../Encounter/SavedEncounter";
import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";


export class PlayerViewClient {
    constructor(private socket: SocketIOClient.Socket) { }

    public JoinEncounter(encounterId: string): any {
        this.socket.emit("join encounter", encounterId);
    }

    public UpdateEncounter(encounterId: string, updatedEncounter: SavedEncounter<StaticCombatantViewModel>) {
        this.socket.emit("update encounter", encounterId, updatedEncounter);
    }

    public UpdateCSS(encounterId: string, updatedCSS: string) {
        this.socket.emit("update custom CSS", encounterId, updatedCSS);
    }
}