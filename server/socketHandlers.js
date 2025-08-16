function removeVoterFromRoom(rooms, roomId, socket) {
  if (!rooms || !rooms[roomId]) return false;

  let found = false;
  const r = rooms[roomId];
  if (r.voters && r.voters[socket.id]) {
    console.log("Removing voter:", socket.id, "from room:", roomId);

    delete r.voters[socket.id];
    delete r.votes[socket.id];
    found = true;
  }

  return found;
}

function removeViewerFromRoom(rooms, roomId, socket) {
  if (!rooms || !rooms[roomId]) return false;

  let found = false;
  const r = rooms[roomId];
  if (r.viewers && r.viewers[socket.id]) {
    console.log("Removing viewer:", socket.id, "from room:", roomId);
    delete r.viewers[socket.id];
    found = true;
  }

  return found;
}

module.exports = (io, rooms, saveRooms) => ({
  createRoom: async (socket, {roomId, name}) => {
    rooms[roomId] = {viewers: {}, voters: {}, votes: {}, showVotes: false};
    rooms[roomId].viewers[socket.id] = {name};

    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    console.log(rooms);
  },

  joinRoom: async (socket, {roomId, name}) => {
    console.log("Voter joined:", roomId, name);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].voters[socket.id] = {name};

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]);

    await saveRooms();
  },

  openRoom: async (socket, {roomId, name}) => {
    console.log("Viewer joined:", roomId, name);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].viewers[socket.id] = {name};

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]);
    await saveRooms();
  },

  setTicket: async ({roomId, ticket}) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTicket = ticket;
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;

      await saveRooms();

      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  },

  vote: async (socket, {roomId, vote}) => {
    if (!rooms[roomId]) return;
    rooms[roomId].votes[socket.id] = vote;

    const room = rooms[roomId];

    // Check if all players have voted
    const playerIds = Object.entries(room.voters)
      .map(([id]) => id);

    const allVoted = playerIds.every(id => room.votes[id] !== undefined);

    if (allVoted) {
      room.showVotes = true;
    }
    await saveRooms();
    io.to(roomId).emit("votesUpdate", rooms[roomId].votes);
  },

  requestRooms: (socket) => {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].voters).length
    }));
    socket.emit("roomsList", roomList);
  },

  leaveRoomVoter: async (socket, {roomId}) => {
    let found = removeVoterFromRoom(rooms, roomId, socket);
    if (found) {
      await saveRooms();
      socket.leave(roomId);
      io.to(roomId).emit("voterUpdate", rooms[roomId].voters);
    }
  },

  leaveRoomViewer: async (socket, {roomId}) => {
    let found = removeViewerFromRoom(rooms, roomId, socket);
    console.log(found);
    if (found) {
      console.log("Voter leave viewer viewer:", rooms[roomId]);
      await saveRooms();
      socket.leave(roomId);
      io.to(roomId).emit("viewerUpdate", rooms[roomId].viewers);
    }
  },

  resetVotes: async ({roomId}) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      await saveRooms();
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  },

  disconnect: async (socket) => {
    console.log("Voter disconnected:", socket.id);
    for (const roomId of Object.keys(rooms)) {
      console.log("Looking for:", socket.id, " in ", rooms[roomId]);

      let found = removeVoterFromRoom(rooms, roomId, socket);
      console.log("Found voter: ", found);
      if (!found) {
        found = removeViewerFromRoom(rooms, roomId, socket);
        console.log("Found viewer: ", found);
      }

      if (found) {
        await saveRooms();
        io.to(roomId).emit("roomUpdate", rooms[roomId]);
        break;
      }
    }
  },
});