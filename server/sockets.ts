import { PlayerViewSettings } from "../common/PlayerViewSettings";
import { PlayerViewManager } from "./playerviewmanager";

export default function (io: SocketIO.Server, playerViews: PlayerViewManager) {
    io.on("connection", function (socket: SocketIO.Socket) {

        let encounterId;

        function joinEncounter(id: string) {
            encounterId = id;
            socket.join(id);
            playerViews.EnsureInitialized(id);
        }

        socket.on("update encounter", function (id: string, updatedEncounter: {}) {
            joinEncounter(id);
            playerViews.UpdateEncounter(id, updatedEncounter);

            socket.broadcast.to(encounterId).emit("encounter updated", updatedEncounter);
        });

        socket.on("update settings", (id: string, updatedSettings: PlayerViewSettings) => {
            joinEncounter(id);
            playerViews.UpdateSettings(id, updatedSettings);
            socket.broadcast.to(encounterId).emit("settings updated", updatedSettings);
        });

        socket.on("join encounter", function (id: string) {
            joinEncounter(id);
        });

        socket.on("suggest damage", function (id: string, suggestedCombatantIds: string[], suggestedDamage: number, suggester: string) {
            joinEncounter(id);
            socket.broadcast.to(encounterId).emit("suggest damage", suggestedCombatantIds, suggestedDamage, suggester);
        });

        socket.on("disconnect", function () {
            io.in(encounterId).clients((error, clients) => {
                if (clients.length == 0) {
                    playerViews.Destroy(encounterId);
                }
            });
        });
    });
}