import { PlayerView } from "../common/PlayerView";

export default function (io: SocketIO.Server, playerViews: { [encounterId: string]: PlayerView }) {
    io.on("connection", function (socket: SocketIO.Socket) {

        let encounterId = null;

        socket.on("update encounter", function (id: string, updatedEncounter: {}) {
            encounterId = id;
            socket.join(encounterId);
            playerViews[encounterId].encounterState = updatedEncounter;
            socket.broadcast.to(encounterId).emit("update encounter", updatedEncounter);
        });

        socket.on("update custom CSS", (id: string, updatedCSS: string) => {
            console.log(`${id} - custom css: ${updatedCSS}`);
        });

        socket.on("join encounter", function (id: string) {
            encounterId = id;
            socket.join(id);
        });

        socket.on("suggest damage", function (id: string, suggestedCombatantIds: string[], suggestedDamage: number, suggester: string) {
            if (id !== encounterId) {
                return;
            }
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