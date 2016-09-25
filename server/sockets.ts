export default function(io, playerViews) {
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('update encounter', function(id, encounter) {
            socket.join(id);
            console.log('encounter: ' + JSON.stringify(encounter));
            playerViews[id] = encounter;
            socket.broadcast.to(id).emit('update encounter', encounter);
        });
        socket.on('join encounter', function(id) {
            console.log(`encounter ${id} joined`);
            socket.join(id);
        })
    });
}