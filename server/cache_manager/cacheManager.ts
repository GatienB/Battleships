class CacheManager {
    private socketsClients: WebSocket[];
    constructor() {
        this.socketsClients = [];
    }

    addNewConnection(newSocket: WebSocket) {
        this.socketsClients.push(newSocket);
    }

    removeConnection(socket: WebSocket) {
        this.socketsClients = this.socketsClients.filter(s => s != socket);
    }
}