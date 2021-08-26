class SocketManager {
    board;
    socket;
    constructor(board) {
        this.board = board;
    }
    wsConnect() {
        console.log(this.board.getBinaryBoard());
        this.socket = new WebSocket("ws://localhost:3001");

        this.socket.onmessage = (event) => {
            console.log("onMessage");
            console.log(event.data);
            this.handleMessage(event.data);
        }

        this.socket.onopen = (event) => {
            console.log("onOpen");
            console.log(event);
            this.socket.send(this.createInitMessage());
        }

        this.socket.onclose = (event) => {
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
                break;
        }
        if (userInfo)
            document.getElementById("message").innerText = userInfo;
        this.handleEvents(msg.events)
    }

    handleEvents(events) {
        if (events) {
            console.log(events);
            if (events.gameStart === true) {
                document.getElementById("play").remove();
            }

            let boat = undefined;
            if (events.boat != undefined && events.boat.length > 0) {
                boat = events.boat;
            }
            /** TODO */
            if (events.attackResult) {
                let res = events.attackResult;
                let position = { x: res.x, y: res.y };
                if (res.state == true) {
                    this.board.onSelfAttackHit(position, boat);
                } else {
                    this.board.onSelfAttackMiss(position);
                }
            }
            if (events.rivalAttack) {
                let res = events.rivalAttack;
                let position = { x: res.x, y: res.y };
                if (res.state == true) {
                    this.board.onRivalAttackHit(position, boat);
                } else {
                    this.board.onRivalAttackMiss(position);
                }
            }

            if (events.gameResult) {
                if (events.gameResult == "WIN") {
                    document.getElementById("message").innerText = "Vous avez gagné !";
                    document.getElementById("message").style.color = "green";
                } else if (events.gameResult == "LOST") {
                    document.getElementById("message").innerText = "Vous avez perdu";
                    document.getElementById("message").style.color = "red";
                }
            }
        }
    }

    sendSelfAttack(position) {
        this.socket.send(JSON.stringify({
            command: "attack",
            position: position
        }));
    }
}