import { PlayerView } from "../common/PlayerView";

export default function (io: SocketIO.Server, playerViews: { [encounterId: string]: PlayerView }) {
    io.on("connection", function (socket: SocketIO.Socket) {

        let encounterId = null;

        function joinEncounter(id) {
            encounterId = id;
            socket.join(id);
            if (playerViews[encounterId] === undefined) {
                playerViews[encounterId] = {
                    encounterState: null,
                    customCSS: ""
                };
            }
        }

        socket.on("update encounter", function (id: string, updatedEncounter: {}) {
            joinEncounter(id);
            playerViews[encounterId].encounterState = updatedEncounter;
            socket.broadcast.to(encounterId).emit("encounter updated", updatedEncounter);
        });

        socket.on("update custom CSS", (id: string, updatedCSS: string) => {
            joinEncounter(id);
            playerViews[encounterId].customCSS = updatedCSS;
            socket.broadcast.to(encounterId).emit("custom CSS updated", updatedCSS);
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
                    delete playerViews[encounterId];
                }
            });
        });
    });
}