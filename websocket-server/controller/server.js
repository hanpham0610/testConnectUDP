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
let jsonTK = [
  { id: "810", user: "admin", pass: "admin123@" },
  { id: "123", user: "userCheck", pass: "user1@" },
  { id: "124", user: "userLog", pass: "user133@" },
  { id: "125", user: "vienTest", pass: "123456" }
];

// Lưu trữ người dùng đã đăng nhập và IP được chấp nhận của họ
let loggedInUsers = {}; // { user: ip }

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const userIp = req.ip;
  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user] === userIp
  );

  if (!user) {
    return res.status(403).send({ message: "Địa chỉ IP không được phép" });
  }

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

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  const userData = jsonTK.find((u) => u.user === user && u.pass === pass);

  if (!userData) {
    return res.status(401).send({ message: "Thông tin đăng nhập không chính xác" });
  }

  // Thử lấy IP từ nhiều nguồn khác nhau
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

  // Kiểm tra xem có header 'x-forwarded-for' không và lấy địa chỉ IP đầu tiên trong chuỗi
  const forwardedIps = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',') : [];
  const ip = forwardedIps.length > 0 ? forwardedIps[0].trim() : userIp;

  console.log(`IP thực tế của người dùng khi đăng nhập: ${ip}`);

  // Đảm bảo người dùng chỉ có thể chấp nhận dữ liệu từ một IP
  if (loggedInUsers[user] && loggedInUsers[user] !== ip) {
    return res.status(403).send({ message: "Người dùng đã đăng nhập từ một IP khác" });
  }

  loggedInUsers[user] = ip; // Lưu trữ IP được chấp nhận của người dùng
  console.log(`Đăng nhập thành công từ IP: ${ip}`);
  res.status(200).send({ message: "Đăng nhập thành công", ip: userIp, user: userData.user });
});
app.post("/api/logout", (req, res) => {
  const { user } = req.body;

  // Kiểm tra xem người dùng có tồn tại trong danh sách đăng nhập không
  if (!loggedInUsers[user]) {
    return res.status(400).send({ message: "Người dùng chưa đăng nhập hoặc đã đăng xuất." });
  }

  // Xóa người dùng khỏi danh sách loggedInUsers
  delete loggedInUsers[user];
  console.log(`Người dùng ${user} đã đăng xuất`);

  res.status(200).send({ message: "Đăng xuất thành công" });
});
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

const udpServer = dgram.createSocket("udp4");

udpServer.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();
  console.log(
    `Đã nhận: ${msg} từ ${rinfo.address}:${rinfo.port} vào lúc ${timestamp}`
  );

  console.log(`Danh sách loggedInUsers:`, loggedInUsers);

  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user] === rinfo.address
  );

  console.log(`User tìm thấy: ${user}`);

  if (!user) {
    console.log(`IP không được phép ${rinfo.address} đã cố gắng gửi dữ liệu.`);
    return; // Từ chối tin nhắn nếu IP không được phép
  }

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
  console.log("Máy chủ UDP đang lắng nghe trên cổng 8080");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Máy chủ đang chạy tại http://0.0.0.0:${port}`);
});
