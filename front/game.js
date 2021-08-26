let board = new Board();
board.createBoard();
board.createRivalBoard();
var game;

document.getElementById("play-button").addEventListener("click", play);
class Game {
    gameStarted = false;
    constructor() {}

    play() {
        if (this.gameStarted)
            return;
        this.gameStarted = true;
        board.removeEventsSelfTable();
        // let t = document.getElementById("board-container");
        // t.classList.add("board__wait");
        board.setSelfWait(true);
        document.getElementById("play-button").setAttribute("disabled", true);
        document.getElementById("play-button").removeEventListener("click", play);
        console.log("play");
        let sManager = new SocketManager(board);
        board.SetSocketManager(sManager);
        sManager.wsConnect();
    }
}

function play() {
    if (game == null) {
        game = new Game();
        game.play();
    }
}