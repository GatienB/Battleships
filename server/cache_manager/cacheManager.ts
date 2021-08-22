import * as WebSocket from "ws";

export class CacheManager {
    private socketsClients: WebSocket[];
    private games: Game[];
    constructor() {
        this.socketsClients = [];
        this.games = [];
    }

    addNewConnection(socket: WebSocket) {
        this.socketsClients.push(socket);
        console.log(`addNewConnection: total[${this.socketsClients.length}]`);
    }

    removeConnection(socket: WebSocket) {
        this.socketsClients = this.socketsClients.filter(s => s != socket);
        this.removePlayerFromGame(socket);
        console.log(`removeConnection: totalGames[${this.games.length}]`);
        console.log(`removeConnection: totalClients[${this.socketsClients.length}]`);
    }

    private removePlayerFromGame(socket: WebSocket) {
        let game: Game[] = this.getGameBySocket(socket);
        if (game.length == 0) {
            console.log("removePlayerFromGame: can't find game associated with socket provided");
        }
        else if (game.length == 1) {
            let g = game[0];
            if (g.GetPlayer1() == socket) {
                g.SetPlayer1(null);
                console.log(`removePlayerFromGame: removing player1 from game ${g.GetId()}`);
            }
            else if (g.GetPlayer2() == socket) {
                g.SetPlayer2(null);
                console.log(`removePlayerFromGame: removing player2 from game ${g.GetId()}`);
            }

            if (g.IsPlayer1Null() && g.IsPlayer2Null()) {
                this.games = this.games.filter(_g => _g != g);
                console.log(`removePlayerFromGame: removing game ${g.GetId()}`);
            }
        }
    }

    addPlayerToGame(socket: WebSocket, gameId: number, boats: Position[][]): Game {
        console.log(typeof boats);
        let gameAddedIn: Game = null;
        let game: Game[] = this.games.filter(g => g.GetId() == gameId);
        if (boats && boats.length > 0) {
            for (let i = 0; i < boats.length; i++) {
                const positions = boats[i];
                console.log(positions);
                console.log(positions[0])
                if (positions.some(p => p.isOutOfBounds())) {
                    return gameAddedIn;
                }
            }
            if (game.length == 0) {
                console.log(`addPlayerToGame: creating game ${gameId}`);
                gameAddedIn = new Game(gameId);
                console.log(`addPlayerToGame: adding player1 to game ${gameId}`);
                gameAddedIn.SetPlayer1(socket);
                gameAddedIn.SetBoatsPlayer1(boats);
                this.games.push(gameAddedIn);
            }
            else if (game.length == 1) {
                let _game = game[0];
                console.log(`addPlayerToGame: player1 == null[${_game.IsPlayer1Null()}]`)
                console.log(`addPlayerToGame: player2 == null[${_game.IsPlayer2Null()}]`)
                if (_game.IsPlayer1Null()) {
                    console.log(`addPlayerToGame: adding player1 to game ${gameId}`);
                    _game.SetPlayer1(socket);
                    gameAddedIn = _game;
                    gameAddedIn.SetBoatsPlayer1(boats);
                }
                else if (_game.IsPlayer2Null()) {
                    console.log(`addPlayerToGame: adding player2 to game ${gameId}`);
                    _game.SetPlayer2(socket);
                    gameAddedIn = _game;
                    gameAddedIn.SetBoatsPlayer2(boats);
                } else {
                    console.log(`addPlayerToGame: Game ${gameId} already has 2 players. Closing connection`)
                    socket.close();
                }
            }
        }
        return gameAddedIn;
    }

    private getGameBySocket(socket: WebSocket): Game[] {
        return this.games.filter(g => g.GetPlayer1() == socket || g.GetPlayer2() == socket);
    }
}


export class Game {
    private id: number;
    private player1: WebSocket;
    private player2: WebSocket;
    private boatsPlayer1: Position[][];
    private boatsPlayer2: Position[][];

    constructor(id: number) {
        this.id = id;
    }

    GetId(): number {
        return this.id;
    }

    GetPlayer1(): WebSocket {
        return this.player1;
    }
    SetPlayer1(socket: WebSocket) {
        this.player1 = socket;
    }

    GetPlayer2(): WebSocket {
        return this.player2;
    }
    SetPlayer2(socket: WebSocket) {
        this.player2 = socket;
    }

    IsPlayer1Null(): boolean {
        return this.player1 == null;
    }
    IsPlayer2Null(): boolean {
        return this.player2 == null;
    }

    IsGameReady(): boolean {
        if (!this.IsPlayer1Null() && !this.IsPlayer2Null()) {
            return true;
        }
        return false;
    }

    GetBoatsPlayer1(): Position[][] {
        return this.clonePositions(this.boatsPlayer1);
    }
    SetBoatsPlayer1(boats: Position[][]) {
        this.boatsPlayer1 = this.clonePositions(boats);
    }

    GetBoatsPlayer2(): Position[][] {
        return this.clonePositions(this.boatsPlayer2);
    }
    SetBoatsPlayer2(boats: Position[][]) {
        this.boatsPlayer2 = this.clonePositions(boats);
    }

    BoatPlayer1Hit(position: Position) {
        if (!position.isOutOfBounds()) {
            for (let i = 0; i < this.boatsPlayer1.length; i++) {
                let positions = this.boatsPlayer1[i];
                if (positions.some(p => p.x == position.x && p.y == position.y)) {
                    positions = positions.filter(p => p.x != position.x && p.y != position.y);
                    return true;
                }
            }
        }
        return false;
    }
    BoatPlayer2Hit(position: Position) {
        if (!position.isOutOfBounds()) {
            for (let i = 0; i < this.boatsPlayer2.length; i++) {
                let positions = this.boatsPlayer2[i];
                if (positions.some(p => p.x == position.x && p.y == position.y)) {
                    positions = positions.filter(p => p.x != position.x && p.y != position.y);
                    return true;
                }
            }
        }
        return false;
    }

    private clonePositions(positions: Position[][]): Position[][] {
        return JSON.parse(JSON.stringify(positions));
    }
}

export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > 9 || this.y < 0 || this.y > 9;
    }
}