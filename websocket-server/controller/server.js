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

  // Lấy địa chỉ IP thực của người dùng
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Kiểm tra xem người dùng đã đăng nhập từ một IP khác chưa
  if (loggedInUsers[user] && loggedInUsers[user].ip !== userIp) {
    return res.status(403).send({ message: "Người dùng đã đăng nhập từ một IP khác" });
  }

  // Lưu lại thông tin người dùng và địa chỉ IP đã đăng nhập
  loggedInUsers[user] = { ip: userIp, user };
  console.log(`Người dùng ${user} đã đăng nhập từ IP: ${userIp}`);
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

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');

  // Lấy địa chỉ IP từ kết nối WebSocket
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Tìm người dùng tương ứng với địa chỉ IP này
  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user].ip === ip
  );

  if (user) {
    ws.user = user; // Gán tên người dùng cho WebSocket client
    console.log(`WebSocket được liên kết với người dùng ${user}`);
  } else {
    console.log(`WebSocket kết nối từ IP không xác định: ${ip}`);
    ws.close(); // Đóng kết nối nếu không tìm thấy người dùng
  }
});

const udpServer = dgram.createSocket("udp4");

udpServer.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();
  console.log(
    `Đã nhận: ${msg} từ ${rinfo.address}:${rinfo.port} vào lúc ${timestamp}`
  );

  // Tìm người dùng tương ứng với địa chỉ IP nhận được từ UDP
  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user].ip === rinfo.address
  );

  if (!user) {
    console.log(`IP không được phép ${rinfo.address} đã cố gắng gửi dữ liệu.`);
    return; // Từ chối tin nhắn nếu IP không được phép
  }

  console.log(`Dữ liệu được chấp nhận từ người dùng ${user}`);

  // Liên kết dữ liệu với người dùng
  const data = {
    user: user,
    message: msg.toString(),
    ip: rinfo.address,
    port: rinfo.port,
    timestamp: timestamp,
  };

  // Gửi dữ liệu qua WebSocket cho đúng người dùng
  wss.clients.forEach((client) => {
    if (client.user === user && client.readyState === WebSocket.OPEN) {
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
