const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const getHandlers = require("./socketHandlers");
const fs = require('fs');

const file = '../realistic_jira_tickets.json';

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

async function clearRooms() {
  console.log("Clearing Rooms");
  for (const key in rooms) delete rooms[key]; // clear in-place
  await saveRooms();
  handlers.requestRooms(io);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", (data) => handlers.createRoom(socket, data));
  socket.on("joinRoom", (data) => handlers.joinRoom(socket, data));
  socket.on("setTicket", (data) => handlers.setTicket(data));
  socket.on("vote", (data) => handlers.vote(socket, data));
  socket.on("requestRooms", () => handlers.requestRooms(io));
  socket.on("resetVotes", (data) => handlers.resetVotes(data));
  socket.on("disconnect", () => handlers.disconnect(socket));
  socket.on("clearRooms", () => clearRooms());
  socket.on("leaveRoomViewer", (data) => handlers.leaveRoomViewer(socket, data));
  socket.on("leaveRoomVoter", (data) => handlers.leaveRoomVoter(socket, data));
  socket.on("openRoom", (data) => handlers.openRoom(socket, data));
  socket.on("makeMeDealer", (data) => handlers.makeMeDealer(socket, data));
});

app.get("/rooms", (req, res) => {
  const roomList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].voters).length
  }));

  res.json(roomList);
});

app.get("/tickets/:projectId", (req, res) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON data:', jsonData);
      let resp = jsonData.hasOwnProperty(req.params.projectId) ? jsonData[req.params.projectId] : [];
      res.json(resp);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
});

app.get("/projects", (req, res) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON data:', jsonData);
      let resp = Object.keys(jsonData);
      res.json(resp);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
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