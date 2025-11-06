require("dotenv").config();

const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const getHandlers = require("./socketHandlers");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 4000;

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

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

function updateRoomActivity(roomId) {
    if (rooms[roomId]) {
        rooms[roomId].lastActivity = Date.now();
    }
}

handlers = getHandlers(io, rooms);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("createRoom", (data) => {
        handlers.createRoom(socket, data);
        startCleanupInterval()
        updateRoomActivity(data.roomId);
    });
    socket.on("joinRoom", (data) => {
        handlers.joinRoom(socket, data);
        updateRoomActivity(data.roomId);
    });
    socket.on("setTicket", (data) => {
        handlers.setTicket(data);
        updateRoomActivity(data.roomId);
    });
    socket.on("vote", (data) => {
        handlers.vote(socket, data);
        updateRoomActivity(data.roomId);
    });
    socket.on("clearVote", (data) => {
        handlers.clearVote(socket, data);
        updateRoomActivity(data.roomId);
    });
    socket.on("requestRooms", () => handlers.requestRooms(io));
    socket.on("resetVotes", (data) => {
        handlers.resetVotes(data);
        updateRoomActivity(data.roomId);
    });
    socket.on("disconnect", () => handlers.disconnect(socket));
    socket.on("clearRooms", () => clearRooms());
    socket.on("closeRoom", (data) => {
        handlers.closeRoom(io, data);
        handlers.requestRooms(io)
    });
    socket.on("leaveRoomViewer", (data) => handlers.leaveRoomViewer(socket, data));
    socket.on("leaveRoomVoter", (data) => handlers.leaveRoomVoter(socket, data));
    socket.on("openRoom", (data) => {
        handlers.openRoom(socket, data);
        updateRoomActivity(data.roomId);
    });
});

let cleanupInterval = null;

function startCleanupInterval() {
    if (!cleanupInterval) {
        cleanupInterval = setInterval(cleanupIdleRooms, 60 * 1000);
    }
}

function stopCleanupInterval() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

function cleanupIdleRooms() {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    for (const roomId in rooms) {
        let lastActivity = rooms[roomId].lastActivity;
        if (lastActivity && now - lastActivity > ONE_HOUR) {
            delete rooms[roomId];
            console.log(`Room ${roomId} cleared due to inactivity.`);
        }
    }

    // Stop interval if no rooms left
    if (Object.keys(rooms).length === 0) {
        stopCleanupInterval();
    }
}

server.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));