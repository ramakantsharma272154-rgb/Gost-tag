const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let players = {};
let ghostId = null;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    players[socket.id] = { x: 0, y: 0, role: 'hunter' };

    // First person to join is the Ghost
    if (!ghostId) {
        ghostId = socket.id;
        players[socket.id].role = 'ghost';
    }

    socket.on('move', (data) => {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        
        // Broadcast all positions to check proximity
        io.emit('update', players);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        if (ghostId === socket.id) ghostId = null;
    });
});

http.listen(3000, () => { console.log('Game running on port 3000'); });

