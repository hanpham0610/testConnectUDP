const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dgram = require("dgram");
const WebSocket = require("ws"); 

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let messages = [];
let acceptedIps = [];

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  messages.push(req.body);
  res.status(201).send();
});
app.delete("/api/messages", (req, res) => {
  messages = []; 
  res.status(200).send({ message: "Dữ liệu đã được xóa thành công." });
});
app.get("/api/accepted-ips", (req, res) => {
  res.json(acceptedIps);
});

app.post("/api/accepted-ips", (req, res) => {
  acceptedIps.push(req.body.ip);
  res.status(201).send();
});

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

const udpServer = dgram.createSocket("udp4");

udpServer.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();
  console.log(
    `Received: ${msg} from ${rinfo.address}:${rinfo.port} at ${timestamp}`
  );

  const data = {
    message: msg.toString(),
    ip: rinfo.address,
    port: rinfo.port,
    timestamp: timestamp,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

udpServer.bind(8080, () => {
  console.log("UDP Server listening on port 8080");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
