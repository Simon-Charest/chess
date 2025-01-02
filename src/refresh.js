function refresh(webSocketServer, response) {
    // Broadcast refresh signal to all WebSocket clients
    webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('refresh');
        }
    });

    // Respond to the client
    response.sendStatus(200);
}

module.exports = refresh;
