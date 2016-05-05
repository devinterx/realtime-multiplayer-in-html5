'use strict';

const SocketClient = require('socket.io-client');
const NetworkGameEvents = require('./game-events');

function network () {
    let socket = null;
    let previousPing = 0.001;
    let netPing = 0.001;
    let netLatency = 0.001;

    function receivePing (data) {
        netPing = new Date().getTime() - data;
        netLatency = netPing / 2;
    }

    function ping () {
        previousPing = new Date().getTime();
        socket.emit('clientPing', previousPing);
    }

    function listen (game) {
        const gameEvents = NetworkGameEvents(game, socket);

        socket.on('serverPing', receivePing);

        socket.on('connect', gameEvents.onConnect);

        socket.on('disconnect', gameEvents.onDisconnect);

        socket.on('playerJoined', gameEvents.onPlayerJoined);
        socket.on('playerLeft', gameEvents.onPlayerLeft);

        // Sent each tick of the server simulation. This is our authoritive update
        socket.on('onserverupdate', gameEvents.onServerUpdate);

        // Handle when we connect to the server, showing state and storing id's.
        socket.on('onconnected', gameEvents.onConnected);

        socket.on('startGame', gameEvents.onStartGame);

        // On error we just show that we are not connected for now. Can print the data.
        socket.on('error', gameEvents.onDisconnect);

        return socket;
    }

    function connect (serverUrl) {
        socket = new SocketClient(serverUrl);

        return {
            listen,
            ping,

            get netPing () {
                return netPing;
            },

            get netLatency () {
                return netLatency;
            },

            send (data) {
                socket.send(data);
            }
        };
    }

    return {
        connect
    };
}

module.exports = network;
