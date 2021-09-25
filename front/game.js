let board = new Board();
board.createBoard();
board.createRivalBoard();

document.getElementById("play-button").addEventListener("click", play);
class Game {
    isGameStarted = false;
    idGame;
    isIaGame;
    constructor() {
        console.log("Game");
        let div = document.getElementById("play-link");
        console.log(div);
        if (div) {
            let t = div.getElementsByTagName("span")[0].innerHTML;
            let reg = t.match(/\/id(\d{6})$/);
            console.log(reg)
            if (reg && reg.length > 1) {
                this.idGame = +reg[1];
            }
        }
        console.log(this.idGame);
    }

    play() {
        if (this.isGameStarted)
            return;
        this.isGameStarted = true;
        board.removeEventsSelfTable();
        // let t = document.getElementById("board-container");
        // t.classList.add("board__wait");
        board.setSelfWait(true);
        document.getElementById("play-button").setAttribute("disabled", true);
        document.getElementById("play-button").removeEventListener("click", play);
        document.getElementsByTagName("body")[0].removeChild(document.getElementsByClassName("board-options")[0]);
        console.log("play");
        let sManager = new SocketManager(board);
        board.SetSocketManager(sManager);
        sManager.wsConnect(this);
    }

    _getRandomInt(min = 0, max = 10000) {
        return Math.floor(min + Math.random() * (max - min));
    }
}

function play() {
    if (game == null) {
        game = new Game();
        game.play();
    }

    if (!game.isGameStarted) {
        game.play();
    }
}


var game = new Game();
let playDiv = document.getElementById("play");
let isIa = false;
if (playDiv) {
    if (playDiv.children[0] && playDiv.children[0].children[1] &&
        playDiv.children[0].children[1].children[0]) {
        isIa = playDiv.children[0].children[1].children[0].getAttribute("href") == null;
    }
}
console.log(isIa);
if (!isIa) {
    document.getElementById("play-link").classList.remove("invisible");
} else {
    game.isIaGame = true;
}

let btn = document.getElementById("randomize-btn");
if (btn) {
    btn.onclick = () => { board.randomizeBoats(); };
}