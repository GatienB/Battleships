class SocketManager {
    board;
    socket;
    game;
    constructor(board) {
        this.board = board;
    }

    closeSocketSilently() {
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
        }
        this.createPlayAgainButton();
    }

    createPlayAgainButton() {
        let msgContainer = document.getElementById("message");
        if (msgContainer) {
            let button = document.createElement("button");
            button.innerText = "Rejouer";
            button.onclick = () => {
                location.reload();
            }
            msgContainer.appendChild(button);
        }
    }

    wsConnect(game) {
        this.game = game;
        console.log(this.board.getBinaryBoard());
        const host = location.origin.split('//')[1];
        let url = "ws://localhost:3000";
        if (!(host.includes("localhost") || host.includes("127.0.0.1"))) {
            if (location.protocol === "https:") {
                url = "wss://";
            } else {
                url = "ws://";
            }
            url = `${url}${host}`;
        }
        this.socket = new WebSocket(url);

        /*
            Todo
            confettis
            
            Done
            revoir messages de victoire/defaite
            bloquer jeu a la fin du jeu
            afficher nb bateaux restants de l autre (et moi aussi)
        */

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
            this.setUserMessage("La connexion avec le serveur a été perdue", "error");
            this.createPlayAgainButton();
        }
    }

    createInitMessage() {
        let positions = this.board.getAllPositions();
        let msg = {
            command: "create",
            boats: JSON.stringify(positions),
            gameId: this.game.idGame,
            isIa: this.game.isIaGame
        };
        return JSON.stringify(msg);
    }

    handleMessage(data) {
        let msg = JSON.parse(data);
        console.log(msg);
        let userInfo = null;
        let dataType = null;
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
            case "rival_disconnected":
                userInfo = msg.message;
                dataType = "error";
                this.board.deactivateEventsRivalTable();
                this.board.setSelfWait(true);
                this.board.setRivalWait(true);
                this.closeSocketSilently();
                break;
            case "chat_message":
                if (msg.content && msg.timestamp) {
                    this.chatMessageReceived(msg.content, +msg.timestamp);
                }
                break;
            default:
                break;
        }
        if (userInfo) {
            this.setUserMessage(userInfo, dataType);
        }
        this.handleEvents(msg.events)
    }

    handleEvents(events) {
        if (events) {
            console.log(events);
            if (events.gameStart === true) {
                document.getElementById("play").remove();
                let boatsStats = Array.from(document.getElementsByClassName("boats-stats"));
                boatsStats.forEach(elmt => {
                    elmt.classList.remove("invisible");
                });
                if (!this.game.isIaGame) {
                    let chat = document.getElementById("chat-container");
                    chat.classList.remove("invisible");
                }
            }

            let boat = undefined;
            if (events.boat != undefined && events.boat.length > 0) {
                boat = events.boat;
            }

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
                let msg, dataType;
                if (events.gameResult == "WIN") {
                    this.board.deactivateEventsRivalTable();
                    msg = "Vous avez gagné !";
                    dataType = "win";
                    this.closeSocketSilently();
                } else if (events.gameResult == "LOST") {
                    msg = "Vous avez perdu";
                    dataType = "lost";
                    this.closeSocketSilently();
                }

                if (msg && dataType) {
                    this.setUserMessage(msg, dataType);
                }
            }
        }
    }

    sendSelfAttack(position) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                command: "attack",
                position: position
            }));
        }
    }

    setUserMessage(message, dataType) {
        let el = document.getElementById("message-text");
        el.parentElement.setAttribute("data-type", dataType);
        el.innerText = message;
    }

    sendMessage(message, tmstmp) {
        let msg = {
            command: "chat_message",
            content: message,
            timestamp: tmstmp
        };
        this.chatMessageSent(message, tmstmp);
        if (this.socket) {
            this.socket.send(JSON.stringify(msg));
        }
    }

    chatMessageSent(message, tmstmp) {
        this.addNewMessage(message, tmstmp, true);
    }

    chatMessageReceived(message, tmstmp) {
        this.addNewMessage(message, tmstmp, false);
    }

    addNewMessage(message, tmstmp, isSent) {
        let msgList = document.getElementById("chat-messages-list");
        if (msgList) {
            let msgElmt = document.createElement("div");
            msgElmt.classList.add("chat-message");
            if (isSent) {
                msgElmt.classList.add("sent");
            }
            msgElmt.innerText = this._getFormattedTime(tmstmp) + " - " + message;
            msgList.prepend(msgElmt);
        }
    }

    _getFormattedTime(tmstmp) {
        let d = new Date(tmstmp);
        let str = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) +
            ":" + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) +
            ":" + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());
        return str;
    }
}
