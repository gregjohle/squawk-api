const app = require("./app");
const { PORT } = require("./config");
const knex = require("knex");
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false },
  },
});

app.set("db", db);

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });
  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });
  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });
  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
  socket.on("disconnect", () => {
    socket.to(roomID).broadcast.emit("user-disconnected", userID);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
