const express = require("express");
const fs = require("fs");
const path = require("path");
const { CacheManager } = require("./cache_manager/cacheManager");
const { SocketManager } = require("./socket_manager");

const app = express();

const PORT = 3000;
const SERVER_ADDR = `http://localhost:${PORT}`;

let cacheManager = new CacheManager();
let socketManager = new SocketManager(cacheManager);

// app.get('', function(req, res) {
//     console.log("ALL path");
// })
app.use("/", express.static(path.join(__dirname, "../front")));

app.get("/", function(req, res) {
    console.log("/ path");
    let id = generateId();
    // res.redirect(`/id${id}`);
    let r = getBoardHtml();
    res.send(r);

    // res.sendFile(path.join(__dirname, "../front/board.html"));
})

// app.get('^/users/:userId([0-9]{6})', function(req, res) {
//     res.send('Route match for User ID: ' + req.params.userId);
// });
app.get(/^\/id\d{6}$/, function(req, res) {
    let reg = req.url.match(/^\/id\d{6}$/);
    if (reg && reg.length == 1 && reg[0].length == 9) {
        let id = +reg[0].substr(3);
        let r = getBoardHtml(id);

        res.send(r);
        // res.sendFile(path.join(__dirname, "../front/board.html"));
        // res.send('Route match for ID: ' + id);
    } else {
        res.redirect("/");
    }
});

app.use((req, res) => {
    res.status(404);
    res.send("404");
});

app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
    console.log("Server address: " + SERVER_ADDR);
});


function getBoardHtml(idGame = 0) {
    let content = fs.readFileSync(path.join(__dirname, "../front/board.html"));
    let contentStr = content.toString();
    let returnStr;
    const strToReplace = `<span><a>IA</a><a href="/">Friend</a></span>`;
    if (idGame > 0) {
        returnStr = contentStr.replace("<span></span>", `<span>${SERVER_ADDR}/id${idGame}</span>`);
        returnStr = returnStr.replace(strToReplace, `<span><a href="/">IA</a><a>Friend</a></span>`);
    } else {
        let idGenerated = generateId();
        returnStr = contentStr.replace("<span></span>", `<span>${SERVER_ADDR}/id${idGenerated}</span>`);
        returnStr = returnStr.replace(strToReplace, `<span><a>IA</a><a href="/id${idGenerated}">Friend</a></span>`);
    }
    return returnStr;
}

function generateId(min = 100000, max = 1000000) {
    return Math.floor(min + Math.random() * (max - min));
}