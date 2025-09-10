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
    playerCount: Object.values(rooms[roomId].voters).filter(([voter]) => voter.removed !== true).length
  }));
  console.log("Sending Rooms: ", roomList);
  io.emit("roomsList", roomList);
}

function handleShowVotes(room) {
  const playerIds = Object.entries(room.voters)
      .filter(([id, voter]) => !voter.removed)
      .map(([id]) => id);

  let votes = room.votes;
  let allVoted = playerIds.every(id => votes[id] !== undefined);

  room.showVotes = allVoted;
  room.isVoting = allVoted ? false : playerIds.some(id => votes[id] !== undefined);

  let values = Object.values(votes);
  room.showFireworks = allVoted && values.length > 1 && values.every(v => v === values[0]);

  console.log(room);
}

function updateVotes(room, io, roomId) {
  handleShowVotes(room);

  io.to(roomId).emit("votesUpdate", {
    votes: room.votes,
    showVotes: room.showVotes,
    isVoting: room.isVoting,
    showFireworks: room.showFireworks
  });
}

module.exports = (io, rooms) => ({
  createRoom: (socket, {roomId, name, userId}) => {
    rooms[roomId] = {
      viewers: {},
      dealer: {name, userId},
      voters: {},
      votes: {},
      showVotes: false,
      isVoting: false,
      showFireworks: false
    };

    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    console.log(rooms);
    refreshRooms(rooms, io);
  },

  joinRoom: (socket, {roomId, name, userId}) => {
    let room = rooms[roomId];

    if (!room) return;

    console.log("Voter joined:", roomId, name, userId);

    socket.join(roomId);

    if (room.viewers[userId]) {
      delete room.viewers[userId];
    }

    room.voters[userId] = {name, userId, socketId: socket.id, removed: false};

    handleShowVotes(room);

    room.showFireworks = false;

    console.log(room);

    io.to(roomId).emit("roomUpdate", room);
    socket.emit("roomUpdate", room);
    },

  openRoom: (socket, {roomId, name, userId}) => {
    console.log("Viewer joined:", roomId, name, userId);

    let room = rooms[roomId];
    if (!room) return;

    socket.join(roomId);

    if (room.voters[userId]) {
      delete room.voters[userId];
    }

    if (room.votes[userId]) {
      delete room.votes[userId];
    }

    room.viewers[userId] = {name, userId, socketId: socket.id, removed: false};

    console.log(room);

    io.to(roomId).emit("roomUpdate", room);
    socket.emit("roomUpdate", room);
  },

  setTicket: ({roomId, ticket}) => {
    let room = rooms[roomId];

    if (room) {
      room.currentTicket = ticket;
      room.votes = {};
      room.showFireworks = false;

      io.to(roomId).emit("ticketUpdate", room.currentTicket);
    }
  },

  vote: (socket, {roomId, vote, userId}) => {
    if (!rooms[roomId]) return;
    const room = rooms[roomId];

    room.votes[userId] = vote;

    updateVotes(room, io, roomId);
  },

  clearVote: (socket, {roomId, userId}) => {
    if (!rooms[roomId]) return;
    const room = rooms[roomId];

    delete room.votes[userId];

    updateVotes(room, io, roomId);
  },

  requestRooms: (io) => {
    refreshRooms(rooms, io);
  },

  leaveRoomVoter: (socket, {roomId, userId}) => {
    let found = removeVoterFromRoom(rooms, roomId, userId);
    if (found) {
      socket.leave(roomId);
      io.to(roomId).emit("voterUpdate", rooms[roomId].voters);
      updateVotes(rooms[roomId], io, roomId);
    }
  },

  leaveRoomViewer: (socket, {roomId, userId}) => {
    let found = removeViewerFromRoom(rooms, roomId, userId);
    console.log(found);
    if (found) {
      console.log("Voter leave viewer viewer:", rooms[roomId]);
      socket.leave(roomId);
      io.to(roomId).emit("viewerUpdate", {
        viewers: rooms[roomId].viewers,
        dealer: rooms[roomId].dealer});
    }
  },

  resetVotes: ({roomId}) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      rooms[roomId].isVoting = false;
      rooms[roomId].showFireworks = false;
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