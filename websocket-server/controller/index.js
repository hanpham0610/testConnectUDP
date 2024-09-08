const dgram = require('dgram');
const WebSocket = require('ws');

const udpServer = dgram.createSocket('udp4');
const wsServer = new WebSocket.Server({ port: 8081 });

wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected');
});

udpServer.on('message', (msg, rinfo) => {
    const timestamp = new Date().toISOString();
    console.log(`Server got: ${msg} from ${rinfo.address}:${rinfo.port} at ${timestamp}`);

    const data = {
        message: msg.toString(),
        ip: rinfo.address,
        port: rinfo.port,
        timestamp: timestamp,
    };

    // Gửi dữ liệu tới tất cả các client WebSocket đã kết nối
    wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

udpServer.bind(8080);
