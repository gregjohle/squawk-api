const app = require("./app");
const { PORT } = require("./config");
const knex = require("knex");
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
// cors must also be configured for socket.io
const io = socket(server, {
  cors: {
    origins: [process.env.ORIGIN],

    handlePreflightRequest: (req, res) => {
      res.writeHead(209, {
        "Access-Control-Allow-Origin": process.env.ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST",
      });
      res.end();
    },
  },
});

// global knex connection
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

app.set("db", db);

// used to hold room information
const rooms = {};

// when conection happens with socket.io
io.on("connection", (socket) => {
  // when a room is joind, if the room is not in the rooms object
  // the user id will be pushed to the object. If the room is not in the rooms
  //object, it will be added
  socket.on("join room", (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    // returns user ID of other user in the room, if there is one
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });
  // relays offer to peer
  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });
  // relays answer to peer
  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });
  // relays ice-candidates to peer
  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
