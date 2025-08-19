require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const getHandlers = require("./socketHandlers");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

let rooms = {};

// serve API routes first (before static)
app.use("/api", require("./routes")(rooms));


// Serve static files from React build
let clientPath = path.join(__dirname, "../client/build");
console.log(clientPath);
let clientIndex = path.join(clientPath, "./index.html");
console.log(clientIndex);

app.use(express.static(clientPath));

// For any other route, send back React's index.html
app.get("/", (req, res) => {
  res.sendFile(clientIndex);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let handlers;

async function clearRooms() {
  console.log("Clearing Rooms");
  for (const key in rooms) delete rooms[key]; // clear in-place
  await saveRooms();
  handlers.requestRooms(io);
}

handlers = getHandlers(io, rooms);

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
  socket.on("closeRoom",  (data) => { handlers.closeRoom(io, data); handlers.requestRooms(io) });
  socket.on("leaveRoomViewer", (data) => handlers.leaveRoomViewer(socket, data));
  socket.on("leaveRoomVoter", (data) => handlers.leaveRoomVoter(socket, data));
  socket.on("openRoom", (data) => handlers.openRoom(socket, data));
});


server.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));