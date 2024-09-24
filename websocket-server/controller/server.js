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
  { id: "810", user: "admin", pass: "admin123@" , code: "0"},
  { id: "123", user: "userGiamSat1", pass: "123456" , code : "1"},
  { id: "124", user: "userQuanLy1", pass: "888888" , code : "1"},
  { id: "125", user: "userGiamSat2", pass: "123456" , code : "2"},
  { id: "126", user: "userQuanLy2", pass: "888888" , code : "2"},
  { id: "127", user: "userGiamSat3", pass: "123456" , code : "3"},
  { id: "128", user: "userQuanLy3", pass: "888888" , code : "3"},
  { id: "129", user: "userGiamSat4", pass: "123456" , code : "4"},
  { id: "130", user: "userQuanLy4", pass: "888888" , code : "4"},
  { id: "131", user: "userGiamSat5", pass: "123456" , code : "5"},
  { id: "132", user: "userQuanLy5", pass: "888888" , code : "5"},
  // { id: "123", user: "userCheck", pass: "123456" },
  // { id: "124", user: "userQuanLy", pass: "888888" },
  { id: "125", user: "vienTest", pass: "123456" , code : "2"},
];

// Lưu trữ người dùng đã đăng nhập và IP được chấp nhận của họ
let loggedInUsers = {}; // { user: ip }

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const userIp = req.ip;
  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user].ip === userIp 
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

app.get("/api/getuser", (req, res) => {
  res.status(200).json(jsonTK);
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  const userData = jsonTK.find((u) => u.user === user && u.pass === pass);

  if (!userData) {
    return res
      .status(401)
      .send({ message: "Thông tin đăng nhập không chính xác" });
  }

  // Thử lấy IP từ nhiều nguồn khác nhau
  const userIp =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  // Kiểm tra xem có header 'x-forwarded-for' không và lấy địa chỉ IP đầu tiên trong chuỗi
  const forwardedIps = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")
    : [];
  const ip = forwardedIps.length > 0 ? forwardedIps[0].trim() : userIp;

  console.log(`IP thực tế của người dùng khi đăng nhập: ${ip}`);

  if (loggedInUsers[user] && loggedInUsers[user] !== ip) {
    return res
      .status(403)
      .send({ message: "Người dùng đã đăng nhập từ một IP khác" });
  }

  loggedInUsers[user] = { ip: ip, code: userData.code };
  console.log(`Đăng nhập thành công từ IP: ${ip}`);
  res
    .status(200)
    .send({ message: "Đăng nhập thành công", ip: userIp, user: userData.user, code: userData.code });
});
app.post("/api/logout", (req, res) => {
  const { user } = req.body;

  if (!loggedInUsers[user]) {
    return res
      .status(400)
      .send({ message: "Người dùng chưa đăng nhập hoặc đã đăng xuất." });
  }

  // Xóa người dùng khỏi danh sách loggedInUsers
  delete loggedInUsers[user];
  console.log(`Người dùng ${user} đã đăng xuất`);

  res.status(200).send({ message: "Đăng xuất thành công" });
});
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
});

const udpServer = dgram.createSocket("udp4");

udpServer.on("message", (msg, rinfo) => {
  const timestamp = new Date().toISOString();
  console.log(
    `Đã nhận: ${msg} từ ${rinfo.address}:${rinfo.port} vào lúc ${timestamp}`
  );

  console.log(`Danh sách loggedInUsers:`, loggedInUsers);

  // Find the user by matching rinfo.address with loggedInUsers[user].ip
  const user = Object.keys(loggedInUsers).find(
    (user) => loggedInUsers[user].ip === rinfo.address
  );

  console.log(`User tìm thấy: ${user}`);

  // Proceed with the rest of your logic only if the user is found
  if (!user) {
    console.log(`IP không được phép ${rinfo.address} đã cố gắng gửi dữ liệu.`);
    return; // Từ chối tin nhắn nếu IP không được phép
  }

  // const userData = jsonTK.find((u) => u.user === user);
  const mayGui = msg.toString().split('___')[0];
  const message = msg.toString().split('___')[1];

  const isCodeMatched = Object.keys(loggedInUsers).some(
    (loggedUser) => loggedInUsers[loggedUser].code === mayGui
  );

  if (!isCodeMatched) {
    console.log(`Mã máy gửi (${mayGui}) không khớp với bất kỳ mã người dùng nào.`);
    return; // Từ chối dữ liệu nếu không khớp mã
  }

  const data = {
    user: user,
    mayGui: mayGui,
    message: message,
    ip: rinfo.address,
    port: rinfo.port,
    timestamp: timestamp,
  };

  // Broadcast the message to all connected WebSocket clients
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
