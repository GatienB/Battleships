function wsConnect() {
    var exampleSocket = new WebSocket("ws://localhost:3001", "coucoucestmoihihi");

    exampleSocket.onmessage = function(event) {
        console.log("onMessage");
        console.log(event);
    }


    exampleSocket.onopen = function(event) {
        console.log("onOpen");
        console.log(event);
        // this.send("COUCOUCOUCOCUOCUCOCUOUCOCUO")
    }
}