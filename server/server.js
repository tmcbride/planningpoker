const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", ({ roomId, dealer }) => {
    rooms[roomId] = { dealer, users: {}, currentTicket: null, votes: {}, showVotes: false };
    socket.join(roomId);
    rooms[roomId].users[socket.id] = { name: dealer, role: "dealer" };
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("joinRoom", ({ roomId, name }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].users[socket.id] = { name, role: "player" };
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("setTicket", ({ roomId, ticket }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTicket = ticket;
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("vote", ({ roomId, vote }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes[socket.id] = vote;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("revealVotes", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].showVotes = true;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("resetVotes", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id];
        delete rooms[roomId].votes[socket.id];
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
      }
    }
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));