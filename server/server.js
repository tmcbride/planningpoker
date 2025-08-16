const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const getHandlers = require("./socketHandlers");

const cors = require("cors");

// const storage = require("node-persist");

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
let handlers;

async function saveRooms() {
  // await storage.setItem(ROOMS_KEY, rooms);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", (data) => handlers.createRoom(socket, data));
  socket.on("joinRoom", (data) => handlers.joinRoom(socket, data));
  socket.on("setTicket", (data) => handlers.setTicket(data));
  socket.on("vote", (data) => handlers.vote(socket, data));
  socket.on("requestRooms", () => handlers.requestRooms(socket));
  socket.on("resetVotes", (data) => handlers.resetVotes(data));
  socket.on("disconnect", () => handlers.disconnect(socket));
  socket.on("clearRooms", async () => { console.log("Clearing Rooms"); rooms = {}; await saveRooms(); });
  socket.on("leaveRoomViewer", (data) => handlers.leaveRoomViewer(socket, data));
  socket.on("leaveRoomVoter", (data) => handlers.leaveRoomVoter(socket, data));
  socket.on("openRoom", (data) => handlers.openRoom(socket, data));
});

app.get("/rooms", (req, res) => {
  const roomList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].voters).length
  }));

  res.json(roomList);
});

// // ---------- Initialize storage ----------
// (async () => {
//   await storage.init({ dir: "./tmp-storage", stringify: JSON.stringify });
//   rooms = (await storage.getItem(ROOMS_KEY)) || {};
//   console.log("Loaded rooms from storage:", rooms);
//   handlers = getHandlers(io, rooms, saveRooms, broadcastRooms);
// })();

handlers = getHandlers(io, rooms, saveRooms);

server.listen(4000, "0.0.0.0", () => console.log("Server running on port 4000"));