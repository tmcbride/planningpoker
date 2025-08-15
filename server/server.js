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

// When a room is created
  socket.on("createRoom", ({ roomId, dealer }) => {
    socket.join(roomId);
    rooms[roomId] = { dealer, users: {}, votes: {}, showVotes: false };
    rooms[roomId].users[socket.id] = { name: dealer, role: "dealer" };
    io.to(roomId).emit("roomUpdate", rooms[roomId]); // <-- sends full room to everyone in that room
    broadcastRooms();
  });

  socket.on("joinRoom", ({ roomId, name }) => {
    console.log("User joined:", roomId, name);

    if (!rooms[roomId]) return; // room must exist
    socket.join(roomId);
    rooms[roomId].users[socket.id] = { name, role: "player" };
    io.to(roomId).emit("roomUpdate", rooms[roomId]); // <-- sends full room to everyone in that room
    broadcastRooms(); // optional: updates room list for everyone
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
    console.log("Room ID: ", roomId);
    if (!rooms[roomId]) return;
    rooms[roomId].votes[socket.id] = vote;

    const room = rooms[roomId];

    // Check if all players have voted
    const playerIds = Object.entries(room.users)
      .filter(([id, user]) => user.role !== "dealer")
      .map(([id]) => id);

    const allVoted = playerIds.every(id => room.votes[id] !== undefined);

    if (allVoted) {
      room.showVotes = true;
    }

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("resetVotes", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  function broadcastRooms() {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].users).length
    }));
    io.emit("roomsList", roomList);
  }

// When a player leaves
  socket.on("disconnect", () => {
    for (const roomId of Object.keys(rooms)) {
      const r = rooms[roomId];
      if (r.users[socket.id]) {
        delete r.users[socket.id];
        delete r.votes[socket.id];
        if (Object.keys(r.users).length === 0) delete rooms[roomId];
        broadcastRooms();
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
      }
    }
  });

  const roomList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].users).length
  }));
  socket.emit("roomsList", roomList);
});

server.listen(4000, () => console.log("Server running on port 4000"));