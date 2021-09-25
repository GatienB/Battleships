import * as WebSocket from "ws";
import { SocketManager } from "../socket_manager";

export class CacheManager {
    private socketsClients: WebSocket[];
    private games: Game[];
    private socketManager: SocketManager;
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
        let game = this.getGameBySocket(socket);
        if (game.length == 0) {
            console.log("removeConnection: can't find game associated with socket provided");
        }
        else if (game.length == 1) {
            let g = game[0];
            if (g && !g.GetIsEndGame()) {
                let rival = g.GetRival(socket);
                if (rival) {
                    this.socketManager.SendRivalDisconnected(rival);
                }
            }
        }
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

    addPlayerToGame(socket: WebSocket, gameId: number, boats: Position[][], isIaGame: boolean): Game {
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
                gameAddedIn.SetIsIaGame(isIaGame);
                this.games.push(gameAddedIn);
            }
            else if (game.length == 1 && !game[0].IsIaGame()) {
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

    playerAttacks(socket: WebSocket, position: Position): boolean {
        let isHit: boolean = null;
        if (socket && position) {
            let game: Game[] = this.getGameBySocket(socket);
            if (game.length == 0) {
                console.log("playerAttacks: can't find game associated with socket provided");
            } else if (game.length == 1) {
                let g = game[0];
                if (g.IsSocketPlayer1(socket)) {
                    isHit = g.Player1Attacks(position);
                } else if (g.IsSocketPlayer2(socket)) {
                    isHit = g.Player2Attacks(position);
                } else {
                    console.log("playerAttacks: Socket not player1 nor player2");
                }
            }
        }

        return isHit;
    }

    GetBoatPositionsIfSunk(socket: WebSocket, position: Position): Position[] {
        let boatPositions: Position[] = [];
        if (socket && position) {
            let game: Game[] = this.getGameBySocket(socket);
            if (game.length == 0) {
                console.log("playerAttacks: can't find game associated with socket provided");
            } else if (game.length == 1) {
                let g = game[0];
                if (g.IsSocketPlayer1(socket)) {
                    boatPositions = g.GetBoatPositionsIfSunk(false, position);
                } else if (g.IsSocketPlayer2(socket)) {
                    boatPositions = g.GetBoatPositionsIfSunk(true, position);
                } else {
                    console.log("playerAttacks: Socket not player1 nor player2");
                }
            }
        }

        return boatPositions;
    }

    getGameBySocket(socket: WebSocket): Game[] {
        return this.games.filter(g => g.GetPlayer1() == socket || g.GetPlayer2() == socket);
    }

    IsEndGame(socket: WebSocket): boolean {
        let retValue: boolean = false;
        let game: Game[] = this.getGameBySocket(socket);
        if (game.length == 0) {
            console.log("playerAttacks: can't find game associated with socket provided");
        } else if (game.length == 1) {
            let g = game[0];
            retValue = g.IsWinner(socket);
        }

        console.log(`IsEndGame: isWinner: ${retValue}`);
        return retValue;
    }

    SetSocketManager(socketManager: SocketManager) {
        this.socketManager = socketManager;
    }
}


export class Game {
    private id: number;
    private player1: WebSocket;
    private player2: WebSocket;
    private boatsPlayer1: Position[][];
    private boatsPlayer2: Position[][];
    private isEndGame: boolean;
    private isIaGame: boolean;
    private iaFreePositions: Position[];

    constructor(id: number) {
        this.id = id;
        this.iaFreePositions = [];
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

    IsIaGame(): boolean {
        return this.isIaGame;
    }
    SetIsIaGame(value: boolean) {
        if (value === true) {
            this.generateBoatsPlayer2();
            this.initIaFreePositionsToPlay()
        }
        this.isIaGame = value;
    }

    IsPlayer1Null(): boolean {
        return this.player1 == null;
    }
    IsPlayer2Null(): boolean {
        return this.player2 == null;
    }

    IsSocketPlayer1(socket: WebSocket): boolean {
        return this.player1 == socket;
    }

    IsSocketPlayer2(socket: WebSocket): boolean {
        return this.player2 == socket;
    }

    GetRival(socket: WebSocket): WebSocket {
        return this.player1 == socket ? this.player2 : this.player1;
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

    GetIsEndGame(): boolean {
        return this.isEndGame;
    }
    SetIsEndGame(val: boolean) {
        this.isEndGame = val;
    }

    Player1Attacks(position: Position) {
        if (!position.isOutOfBounds()) {
            for (let i = 0; i < this.boatsPlayer2.length; i++) {
                let positions = this.boatsPlayer2[i];
                if (positions.some(p => !p.isHit && p.x == position.x && p.y == position.y)) {
                    let pos = positions.filter(p => !p.isHit && p.x == position.x && p.y == position.y)[0];
                    pos.isHit = true;
                    // positions = positions.filter(p => p.x != position.x && p.y != position.y);
                    return true;
                }
            }
        }
        return false;
    }
    Player2Attacks(position: Position) {
        if (!position.isOutOfBounds()) {
            for (let i = 0; i < this.boatsPlayer1.length; i++) {
                let positions = this.boatsPlayer1[i];
                if (positions.some(p => !p.isHit && p.x == position.x && p.y == position.y)) {
                    let pos = positions.filter(p => !p.isHit && p.x == position.x && p.y == position.y)[0];
                    pos.isHit = true;
                    // positions = positions.filter(p => p.x != position.x && p.y != position.y);
                    return true;
                }
            }
        }
        return false;
    }

    GetBoatPositionsIfSunk(isPlayer1: boolean, position: Position): Position[] {
        let returnPositions: Position[] = [];
        let boats: Position[][];
        if (isPlayer1) {
            boats = this.boatsPlayer1;
        }
        else {
            boats = this.boatsPlayer2;
        }

        if (!position.isOutOfBounds()) {
            for (let i = 0; i < boats.length; i++) {
                let positions = boats[i];
                if (positions.some(p => p.x == position.x && p.y == position.y)) {
                    if (positions.some(p => !p.isHit)) {
                        break;
                    }
                    else {
                        for (let j = 0; j < positions.length; j++) {
                            returnPositions.push(positions[j]);
                        }
                        break;
                    }
                }
            }
        }

        return returnPositions;
    }

    IsWinner(socket: WebSocket): boolean {
        if (this.IsSocketPlayer1(socket)) {
            let isWinner = true;
            for (let i = 0; i < this.boatsPlayer2.length; i++) {
                let positions = this.boatsPlayer2[i];
                if (positions.some(p => !p.isHit)) {
                    isWinner = false;
                    break;
                }
            }
            if (isWinner) {
                this.SetIsEndGame(true);
            }
            return isWinner;
        }
        else if (this.IsSocketPlayer2(socket)) {
            let isWinner = true;
            for (let i = 0; i < this.boatsPlayer1.length; i++) {
                let positions = this.boatsPlayer1[i];
                if (positions.some(p => !p.isHit)) {
                    isWinner = false;
                    break;
                }
            }
            if (isWinner) {
                this.SetIsEndGame(true);
            }
            return isWinner;
        }

        return false;
    }


    IsIaWinner(): boolean {
        let isWinner = true;
        for (let i = 0; i < this.boatsPlayer1.length; i++) {
            let positions = this.boatsPlayer1[i];
            if (positions.some(p => !p.isHit)) {
                isWinner = false;
                break;
            }
        }
        if (isWinner) {
            this.SetIsEndGame(true);
        }
        return isWinner;
    }

    GetNextIAMove(): Position {
        let pos: Position;

        let boatHit = this.boatsPlayer1.filter(b => b.some(p => p.isHit) && b.some(p => !p.isHit))[0];

        if (boatHit) {
            // un bateau est déjà touché mais pas coulé
            let cellsHit = boatHit.filter(p => p.isHit);
            pos = this.getPositionNextMove(cellsHit, this.iaFreePositions);
            let index = this.iaFreePositions.findIndex(p => p.x == pos.x && p.y == pos.y);
            if (index >= 0) {
                this.iaFreePositions.splice(index, 1);
            } else {
                pos = this.getRandomPositionInFreePositions(true);
            }
        }
        else {
            pos = this.getRandomPositionInFreePositions(true);
        }
        console.log(pos);
        return pos;
    }

    IaAttacks(position: Position): boolean {
        if (!position.isOutOfBounds()) {
            for (let i = 0; i < this.boatsPlayer1.length; i++) {
                let positions = this.boatsPlayer1[i];
                if (positions.some(p => !p.isHit && p.x == position.x && p.y == position.y)) {
                    let pos = positions.filter(p => !p.isHit && p.x == position.x && p.y == position.y)[0];
                    pos.isHit = true;
                    return true;
                }
            }
        }
        return false;
    }

    private getPositionNextMove(boatHitPositions: Position[], freePositions: Position[]): Position {
        let positionToPlay: Position = null;

        if (boatHitPositions.length == 1) {
            // random N,S,W,E
            return this.getCardinalMoves(boatHitPositions[0], freePositions)[0];
        } else {
            // determine orientation
            let orientation = this.getOrientation(boatHitPositions);
            if (orientation === "H") {
                boatHitPositions.sort(p => p.y);
                let firstPos = boatHitPositions[0];
                let yTest = firstPos.y - 1;
                positionToPlay = freePositions.filter(p => p.x == firstPos.x && p.y == yTest)[0];
                if (positionToPlay) {
                    return positionToPlay;
                } else {
                    // si c'etait pas a gauche cest forcement a droite car sort by y
                    for (yTest = firstPos.y + 1; yTest < 10; yTest++) {
                        positionToPlay = freePositions.filter(p => p.x == firstPos.x && p.y == yTest)[0];
                        if (positionToPlay != null) {
                            break;
                        }
                    }
                }
            } else if (orientation === "V") {
                boatHitPositions.sort(p => p.x);
                let firstPos = boatHitPositions[0];
                let xTest = firstPos.x - 1;
                positionToPlay = freePositions.filter(p => p.x == xTest && p.y == firstPos.y)[0];
                if (positionToPlay) {
                    return positionToPlay;
                } else {
                    // si c'etait pas en haut cest forcement en bas car sort by x
                    for (xTest = firstPos.x + 1; xTest < 10; xTest++) {
                        positionToPlay = freePositions.filter(p => p.x == xTest && p.y == firstPos.y)[0];
                        if (positionToPlay != null) {
                            break;
                        }
                    }
                }
            }
            else {
                // random N,S,W,E
                // return this.getCardinalMoves(boatHitPositions[0], freePositions)[0];
                throw Error("PAS NORMAL");
            }
        }

        return positionToPlay;
    }

    private getCardinalMoves(posReference: Position, freePositions: Position[]): Position[] {
        let moves: Position[] = [];

        // N
        let pos = freePositions.filter(p => p.x == posReference.x - 1 && p.y == posReference.y)[0];
        if (pos) {
            moves.push(pos);
        }
        // S
        pos = freePositions.filter(p => p.x == posReference.x + 1 && p.y == posReference.y)[0];
        if (pos) {
            moves.push(pos);
        }
        // W
        pos = freePositions.filter(p => p.x == posReference.x && p.y == posReference.y - 1)[0];
        if (pos) {
            moves.push(pos);
        }
        // E
        pos = freePositions.filter(p => p.x == posReference.x && p.y == posReference.y + 1)[0];
        if (pos) {
            moves.push(pos);
        }

        if (moves.length == 0 && freePositions.length > 0) {
            moves.push(freePositions[0]);
            throw Error("freePositions empty --> PAS NORMAL");
        }

        return moves;
    }

    private getRandomNumber(min: number, max: number): number {
        return Math.floor(min + Math.random() * (max - min));
    }

    private getOrientation(positions: Position[]) {
        let x, y;
        let isHorizontal = false;
        let isVertical = false;
        if (positions.length <= 1) {
            return "H_V";
        } else {
            x = positions[0].x;
            y = positions[0].y;
            isHorizontal = !positions.map(v => v.x).some(_x => _x != x);
            isVertical = !positions.map(v => v.y).some(_y => _y != y);

            if (isHorizontal && isVertical) {
                return "H_V";
            } else if (isHorizontal) {
                return "H";
            } else if (isVertical) {
                return "V";
            }
        }
    }

    private generateBoatsPlayer2() {
        /*
            Number | Size
                2     4
                1     3
                3     2
                4     1   
        */
        const TOTAL_BOATS = 10;
        let BOATS_SETTINGS = [
            { boatSize: 4, count: 1 },
            { boatSize: 3, count: 2 },
            { boatSize: 2, count: 3 },
            { boatSize: 1, count: 4 },
        ]
        /*
        let boats = [
            [{ "y": 5, "x": 4 }, { "y": 5, "x": 6 }, { "y": 5, "x": 7 }, { "y": 5, "x": 5 }],
            [{ "y": 1, "x": 2 }, { "y": 1, "x": 3 }, { "y": 1, "x": 4 }],
            [{ "y": 0, "x": 6 }, { "y": 1, "x": 6 }, { "y": 2, "x": 6 }],
            [{ "y": 8, "x": 6 }, { "y": 9, "x": 6 }],
            [{ "y": 5, "x": 0 }, { "y": 5, "x": 1 }],
            [{ "y": 7, "x": 1 }, { "y": 7, "x": 2 }],
            [{ "y": 7, "x": 8 }],
            [{ "y": 3, "x": 3 }],
            [{ "y": 1, "x": 0 }],
            [{ "y": 1, "x": 9 }]
        ];*/

        this.initIaFreePositionsToPlay();
        this.boatsPlayer2 = [];
        for (const key in BOATS_SETTINGS) {
            const setting = BOATS_SETTINGS[key];
            for (let c = 0; c < setting.count; c++) {
                let isOk = false;
                let positions: Position[] = [];
                while (!isOk) {
                    let orientation = this.getRandomNumber(0, 2);
                    let initialPos = this.getRandomPositionInFreePositions();
                    positions = this.getFreePositionsFromPosInit(initialPos, orientation, setting.boatSize, this.iaFreePositions);
                    if (positions.length == setting.boatSize) {
                        positions.forEach(p => {
                            let index = this.iaFreePositions.indexOf(p);
                            if (index >= 0) {
                                this.iaFreePositions.splice(index, 1);
                            } else {
                                throw Error("Index < 0, pas normal");
                            }
                        });
                        isOk = true;
                    }
                }
                this.boatsPlayer2.push(positions);
            }
        }
        console.log(this.boatsPlayer2);
    }

    private getFreePositionsFromPosInit(positionInit: Position, orientation: number, size: number, freePositions: Position[]): Position[] {
        let positionsList: Position[] = [positionInit];
        if (orientation === 0) {
            // H
            for (let y = positionInit.y + 1; y < 10; y++) {
                let posFree = freePositions.filter(p => p.x == positionInit.x && p.y == y)[0];
                if (posFree && positionsList.length < size) {
                    positionsList.push(posFree);
                }
                else {
                    break;
                }
            }
            if (positionsList.length < size) {
                for (let y = positionInit.y - 1; y > 0; y--) {
                    let posFree = freePositions.filter(p => p.x == positionInit.x && p.y == y)[0];
                    if (posFree && positionsList.length < size) {
                        positionsList.push(posFree);
                    }
                    else {
                        break;
                    }
                }
            }
        } else {
            // V
            for (let x = positionInit.x + 1; x < 10; x++) {
                let posFree = freePositions.filter(p => p.x == x && p.y == positionInit.y)[0];
                if (posFree && positionsList.length < size) {
                    positionsList.push(posFree);
                }
                else {
                    break;
                }
            }
            if (positionsList.length < size) {
                for (let x = positionInit.x - 1; x > 0; x--) {
                    let posFree = freePositions.filter(p => p.x == x && p.y == positionInit.y)[0];
                    if (posFree && positionsList.length < size) {
                        positionsList.push(posFree);
                    }
                    else {
                        break;
                    }
                }
            }
        }

        return positionsList;
    }

    private getRandomPositionInFreePositions(removeFromList: boolean = false): Position {
        let maxId = this.iaFreePositions.length;
        let index = this.getRandomNumber(0, maxId);
        let pos = this.iaFreePositions[index];
        if (removeFromList && index >= 0) {
            this.iaFreePositions.splice(index, 1);
        }
        return pos;
    }
    private initIaFreePositionsToPlay() {
        this.iaFreePositions = [];
        for (let l = 0; l < 10; l++) {
            for (let c = 0; c < 10; c++) {
                this.iaFreePositions.push(new Position(l, c));
            }
        }
    }

    private clonePositions(positions: Position[][]): Position[][] {
        return JSON.parse(JSON.stringify(positions));
    }
}

export class Position {
    x: number;
    y: number;
    isHit: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.isHit = false;
    }

    isOutOfBounds() {
        return this.x == null || this.y == null || this.x < 0 || this.x > 9 || this.y < 0 || this.y > 9;
    }

    // setIsHit() {
    //     this.isHit = true;
    // }

    // IsHit() {
    //     return this.isHit;
    // }
}