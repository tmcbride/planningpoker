function removeVoterFromRoom(rooms, roomId, userId) {
  if (!rooms || !rooms[roomId]) return false;

  let found = false;
  const r = rooms[roomId];
  if (r.voters && r.voters[userId]) {
    console.log("Removing voter:", userId, "from room:", roomId);

    if (r.voters[userId]) {
      r.voters[userId].removed = true;
    }
    if (r?.votes[userId]) {
      r.votes[userId].removed = true;
    }
    found = true;
  }

  return found;
}

function removeViewerFromRoom(rooms, roomId, userId) {
  if (!rooms || !rooms[roomId]) return false;

  let found = false;
  const r = rooms[roomId];
  if (r.viewers && r.viewers[userId]) {
    console.log("Removing viewer:", userId, "from room:", roomId);
    delete r.viewers[userId];
    found = true;
  }

  return found;
}

function removeUserBySocketId(rooms, roomId, socketId) {
  if (!rooms || !rooms[roomId]) return false;

  const r = rooms[roomId];
  let found = false;
  let viewer = Object.values(r.viewers).find(v => v.socketId === socketId);
  if (viewer) {
    found = removeViewerFromRoom(rooms, roomId, viewer.userId);
  }

  let voter = Object.values(r.voters).find(v => v.socketId === socketId);
  if (voter) {
    found ||= removeVoterFromRoom(rooms, roomId, voter.userId);
  }

  return found;
}

function refreshRooms(rooms, io) {
  const roomList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].voters).length
  }));
  console.log("Sending Rooms: ", roomList);
  io.emit("roomsList", roomList);
}

module.exports = (io, rooms) => ({
  createRoom: (socket, {roomId, name, userId}) => {
    rooms[roomId] = {viewers: {}, dealer: {name, userId}, voters: {}, votes: {}, showVotes: false};

    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    console.log(rooms);
    refreshRooms(rooms, io);
  },

  joinRoom: (socket, {roomId, name, userId}) => {
    console.log("Voter joined:", roomId, name, userId);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].voters[userId] = {name, userId, socketId: socket.id, removed: false};

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]);
    },

  openRoom: (socket, {roomId, name, userId}) => {
    console.log("Viewer joined:", roomId, name, userId);

    let room = rooms[roomId];
    if (!room) return;
    socket.join(roomId);
    room.viewers[userId] = {name, userId, socketId: socket.id, removed: false};

    io.to(roomId).emit("roomUpdate", room);
    socket.emit("roomUpdate", room);
  },

  setTicket: ({roomId, ticket}) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTicket = ticket;
      rooms[roomId].votes = {};

      io.to(roomId).emit("ticketUpdate", rooms[roomId].currentTicket);
    }
  },

  vote: (socket, {roomId, vote, userId}) => {
    if (!rooms[roomId]) return;
    rooms[roomId].votes[userId] = vote;

    const room = rooms[roomId];

    // Check if all players have voted
    const playerIds = Object.entries(room.voters)
        .filter(([id, voter]) => !voter.removed)
      .map(([id]) => id);

    room.showVotes = playerIds.every(id => room.votes[id] !== undefined);

    io.to(roomId).emit("votesUpdate", {votes: room.votes, showVotes: room.showVotes});
  },

  requestRooms: (io) => {
    refreshRooms(rooms, io);
  },

  leaveRoomVoter: (socket, {roomId, userId}) => {
    let found = removeVoterFromRoom(rooms, roomId, userId);
    if (found) {
      socket.leave(roomId);
      io.to(roomId).emit("voterUpdate", rooms[roomId].voters);
    }
  },

  leaveRoomViewer: (socket, {roomId, userId}) => {
    let found = removeViewerFromRoom(rooms, roomId, userId);
    console.log(found);
    if (found) {
      console.log("Voter leave viewer viewer:", rooms[roomId]);
      socket.leave(roomId);
      io.to(roomId).emit("viewerUpdate", {viewers: rooms[roomId].viewers, dealer: rooms[roomId].dealer});
    }
  },

  resetVotes: ({roomId}) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  },

  closeRoom: (io, {roomId}) => {
    console.log("Deleting Room", roomId);
    delete rooms[roomId];
    io.to(roomId).emit("roomClosed");
  },

  disconnect: (socket) => {
    console.log("Voter disconnected:", socket.id);
    for (const roomId of Object.keys(rooms)) {
      console.log("Looking for:", socket.id, " in ", rooms[roomId]);

      let found = removeUserBySocketId(rooms, roomId, socket.id);

      if (found) {
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
        break;
      }
    }
  },
});