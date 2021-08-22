import * as WebSocket from "ws";
import { CacheManager, Game , Position } from "./cache_manager/cacheManager";

export class SocketManager {
    private port: number = 3001;
    private cacheManager: CacheManager;
    private server: WebSocket.Server;
    constructor(cacheManager: CacheManager) {
        this.cacheManager = cacheManager;
        this.server = this.initServer();
    }

    private initServer(): WebSocket.Server {
        let server = new WebSocket.Server({
            port: this.port
        });

        server.on('connection', (socket) => {
            this.cacheManager.addNewConnection(socket);

            // When you receive a message, send that message to every socket.
            socket.on('message', (data: WebSocket.Data) => {
                let msg = JSON.parse(data.toString());
                if(msg.command === "create" && msg.gameId && msg.boats) {
                    let boats: Position[][] = this.castTo2nPositionArray(msg.boats);
                    let game = this.cacheManager.addPlayerToGame(socket, msg.gameId, boats);
                    if (game) {
                        if(game.IsGameReady()) {
                        this.sendGameStart(game);
                        }
                        else {
                            this.sendWaitOpponent(socket);
                        }
                    }else {
                        console.log("No game for this socket");
                        socket.close();
                    }
                }
                console.log(data.toString());
            });

            // When a socket closes, or disconnects, remove it from the array.
            socket.on('close', (e) => {
                console.log("Close " + e);
                this.cacheManager.removeConnection(socket);
            });
        });

        return server;
    }

    private sendGameStart(game: Game) {
        game.GetPlayer1().send(JSON.stringify({command: "ready", events: {gameStart: true}}));
        game.GetPlayer2().send(JSON.stringify({command: "wait", events: {gameStart: true}}));
    }
    private sendWaitOpponent(socket: WebSocket) {
        socket.send(JSON.stringify({command: "wait_for_opponent"}));
    }

    private castTo2nPositionArray(_boats: string): Position[][] {
        let positions: Position[][] = [];
        let boats = JSON.parse(_boats);
        if(boats && boats.length > 0) {
            for (let i = 0; i < boats.length; i++) {
                const b = boats[i];
                let boatPos: Position[] = [];
                b.forEach(p => {
                    let position = new Position(p.x,p.y);
                    boatPos.push(position);
                });
                positions.push(boatPos);
            }
        }

        return positions;
    }
}
