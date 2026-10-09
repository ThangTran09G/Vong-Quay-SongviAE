const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "DoiMatKhauNay123!";
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return {
      names: Array.isArray(data.names) ? data.names : [],
      winners: Array.isArray(data.winners) ? data.winners : [],
      lastWinner: data.lastWinner || null,
      round: Number(data.round) || 0
    };
  } catch {
    return { names: [], winners: [], lastWinner: null, round: 0 };
  }
}
let state = loadData();

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}
function publicState() {
  return {
    names: state.names,
    winners: state.winners,
    lastWinner: state.lastWinner,
    round: state.round
  };
}
function isAdmin(socket) {
  return socket.data.isAdmin === true;
}
function sendError(socket, message) {
  socket.emit("admin:error", message);
}

app.get("/health", (_req, res) => res.json({ ok: true }));

io.on("connection", (socket) => {
  socket.emit("state:update", publicState());

  socket.on("admin:login", (password) => {
    if (typeof password === "string" && password === ADMIN_PASSWORD) {
      socket.data.isAdmin = true;
      socket.emit("admin:login-result", { ok: true });
    } else {
      socket.emit("admin:login-result", { ok: false, message: "Mật khẩu chưa đúng." });
    }
  });

  socket.on("admin:set-names", (rawNames) => {
    if (!isAdmin(socket)) return sendError(socket, "Chỉ Admin mới được sửa danh sách.");
    if (typeof rawNames !== "string") return sendError(socket, "Danh sách không hợp lệ.");
    const names = [...new Set(rawNames.split(/\r?\n|,/).map(n => n.trim()).filter(Boolean))];
    if (names.length < 2) return sendError(socket, "Vui lòng nhập ít nhất 2 tên.");
    if (names.length > 1000) return sendError(socket, "Tối đa 1.000 người tham gia.");
    state.names = names;
    state.winners = state.winners.filter(w => names.includes(w.name));
    if (state.lastWinner && !names.includes(state.lastWinner.name)) state.lastWinner = null;
    saveData();
    io.emit("state:update", publicState());
    socket.emit("admin:notice", "Đã cập nhật " + names.length + " người tham gia.");
  });

  socket.on("admin:spin", () => {
    if (!isAdmin(socket)) return sendError(socket, "Chỉ Admin mới được nhấn quay.");
    const alreadyWon = new Set(state.winners.map(w => w.name));
    const eligible = state.names.filter(name => !alreadyWon.has(name));
    if (eligible.length === 0) return sendError(socket, "Không còn người chưa trúng. Hãy cập nhật danh sách hoặc đặt lại lịch sử.");
    const winnerIndex = Math.floor(Math.random() * eligible.length);
const winner = eligible[winnerIndex];
    state.round += 1;
    state.lastWinner = { name: winner, round: state.round, time: new Date().toISOString() };
    state.winners.push(state.lastWinner);
    saveData();
    io.emit("spin:start", {
  winner,
  winnerIndex,
  round: state.round,
  duration: 5200,
  time: state.lastWinner.time,
  eligibleCount: eligible.length
});
    // State is sent after the animation begins so every connected viewer gets the same winner.
    setTimeout(() => io.emit("state:update", publicState()), 5350);
  });

  socket.on("admin:reset-winners", () => {
    if (!isAdmin(socket)) return sendError(socket, "Chỉ Admin mới được đặt lại lịch sử.");
    state.winners = [];
    state.lastWinner = null;
    state.round = 0;
    saveData();
    io.emit("state:update", publicState());
    socket.emit("admin:notice", "Đã đặt lại lịch sử trúng thưởng.");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vòng quay đang chạy tại http://localhost:${PORT}`);
  console.log("Đổi mật khẩu Admin bằng biến môi trường ADMIN_PASSWORD trước khi dùng thật.");
});