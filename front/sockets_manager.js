class SocketManager {
    board;
    constructor(board) {
        this.board = board;
    }
    wsConnect() {
        console.log(this.board.getBinaryBoard());
        var socket = new WebSocket("ws://localhost:3001");

        socket.onmessage = (event) => {
            console.log("onMessage");
            console.log(event.data);
            this.handleMessage(event.data);
        }

        socket.onopen = (event) => {
            console.log("onOpen");
            console.log(event);
            socket.send(this.createInitMessage());
        }

        socket.onclose = function(event) {
            console.log("onClose");
            console.log(event);
        }
    }

    createInitMessage() {
        let positions = this.board.getAllPositions();
        let msg = {
            command: "create",
            boats: JSON.stringify(positions),
            gameId: 123456
        };
        return JSON.stringify(msg);
    }

    handleMessage(data) {
        let msg = JSON.parse(data);
        console.log(msg);
        let userInfo = null;
        switch (msg.command) {
            case "wait_for_opponent":
                userInfo = "En attente de l'adversaire";
                break;
            case "wait":
                userInfo = "C'est à votre adversaire. Attendez";
                this.board.deactivateEventsRivalTable();
                this.board.setSelfWait(false);
                this.board.setRivalWait(true);
                break;
            case "ready":
                userInfo = "A vous de jouer";
                this.board.activateEventsRivalTable();
                this.board.setSelfWait(true);
                this.board.setRivalWait(false);
                break;
            default:
                return;
        }
        document.getElementById("message").innerText = userInfo;
        this.handleEvents(msg.events)
    }

    handleEvents(events) {
        if (events) {
            console.log(events);
            if (events.gameStart === true) {
                document.getElementById("play").remove();
            }
        }
    }
}