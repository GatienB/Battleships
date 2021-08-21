const express = require("express");
const path = require("path");
const app = express();


const WebSocket = require('ws');
const server = new WebSocket.Server({
    port: 3001
});

let sockets = [];
server.on('connection', function(socket) {
    sockets.push(socket);

    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg) {
        sockets.forEach(s => s.send(msg));
    });

    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
    });
});

// app.get('', function(req, res) {
//     console.log("ALL path");
// })
app.use("/", express.static(path.join(__dirname, "../front")));

app.get("/", function(req, res) {
    // res.send("ok");

    console.log("/ path");
    res.sendFile(path.join(__dirname, "../front/board.html"));
})

// app.get('^/users/:userId([0-9]{6})', function(req, res) {
//     res.send('Route match for User ID: ' + req.params.userId);
// });
app.get(/^\/Id\d{6}$/, function(req, res) {
    let reg = req.url.match(/^\/Id\d{6}$/);
    if (reg && reg.length == 1 && reg[0].length == 9) {
        let id = +reg[0].substr(3);
        res.send('Route match for ID: ' + id);
    } else {
        res.redirect("/");
    }
});

app.use((req, res) => {
    res.status(404);
    res.send("404");
});

app.listen(3000, () => {
    console.log("launched");
})