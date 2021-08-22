const express = require("express");
const path = require("path");
const { CacheManager } = require("./cache_manager/cacheManager");
const { SocketManager } = require("./socket_manager");

const app = express();

let cacheManager = new CacheManager();
let socketManager = new SocketManager(cacheManager);

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