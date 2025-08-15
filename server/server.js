const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const storage = require("node-persist");


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const ROOMS_KEY = "rooms";
let rooms = {};

// ---------- Initialize storage ----------
(async () => {
  await storage.init({ dir: "./tmp-storage", stringify: JSON.stringify });
  rooms = (await storage.getItem(ROOMS_KEY)) || {};
  console.log("Loaded rooms from storage:", rooms);
})();

async function saveRooms() {
  await storage.setItem(ROOMS_KEY, rooms);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", async ({ roomId, dealer }) => {
    rooms[roomId] = { dealer, users: {}, votes: {}, showVotes: false };
    rooms[roomId].users[socket.id] = { name: dealer, role: "dealer" };
    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    broadcastRooms();
  });

  socket.on("joinRoom", async ({ roomId, name }) => {
    console.log("User joined:", roomId, name);

    if (!rooms[roomId]) return; // room must exist
    socket.join(roomId);
    rooms[roomId].users[socket.id] = { name, role: "player" };
    io.to(roomId).emit("roomUpdate", rooms[roomId]); // <-- sends full room to everyone in that room
    await saveRooms();
    broadcastRooms(); // optional: updates room list for everyone
  });


  socket.on("setTicket", async ({ roomId, ticket }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTicket = ticket;
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      await saveRooms(rooms); // persist change

      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  socket.on("vote", async ({ roomId, vote }) => {
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
    await saveRooms();
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("requestRooms", () => {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].users).length
    }));
    socket.emit("roomsList", roomList);
  });

  socket.on("resetVotes", async ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      await saveRooms(rooms); // persist change
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });

  function broadcastRooms() {
    if (!rooms) return;
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].users).length
    }));
    io.emit("roomsList", roomList);
  }

// When a player leaves
  socket.on("disconnect", async () => {
    for (const roomId of Object.keys(rooms)) {
      const r = rooms[roomId];
      if (r.users[socket.id]) {
        delete r.users[socket.id];
        delete r.votes[socket.id];
        if (Object.keys(r.users).length === 0) delete rooms[roomId];
        await saveRooms();
        broadcastRooms();
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
      }
    }
  });

  const roomList = !rooms ? [] : Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].users).length
  }));
  socket.emit("roomsList", roomList);
});

server.listen(4000, () => console.log("Server running on port 4000"));