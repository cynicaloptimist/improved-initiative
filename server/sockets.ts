export default function(io: SocketIO.Server, playerViews) {
    io.on('connection', function (socket: SocketIO.Socket) {

        var encounterId = null;

        socket.on('update encounter', function (id, updatedEncounter) {
            encounterId = id;
            socket.join(encounterId);
            playerViews[encounterId] = updatedEncounter;
            socket.broadcast.to(encounterId).emit('update encounter', updatedEncounter);
        });

        socket.on('join encounter', function (id) {
            encounterId = id;
            socket.join(id);
        });

        socket.on('disconnect', function () {
            io.in(encounterId).clients((error, clients) => {
                if (clients.length == 0) {
                    delete playerViews[encounterId];
                }
            });
        });
    });
}