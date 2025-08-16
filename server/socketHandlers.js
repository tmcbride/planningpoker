
async function removeUserFromRoom(rooms, roomId, socket, saveRooms) {
  if (!rooms) return;
  const r = rooms[roomId];
  if (r && r.voters && r.voters[socket.id]) {
    delete r.voters[socket.id];
    delete r.votes[socket.id];
  }

  if (r && r.viewers && r.viewers[socket.id]) {
    delete r.viewers[socket.id];
  }

  await saveRooms();
}

module.exports = (io, rooms, saveRooms, broadcastRooms) => ({
  createRoom: async (socket, { roomId, name }) => {
    rooms[roomId] = { viewers: {}, voters: {}, votes: {}, showVotes: false };
    rooms[roomId].viewers[socket.id] = { name };

    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    broadcastRooms();
  },

  joinRoom: async (socket, { roomId, name }) => {
    console.log("Voter joined:", roomId, name);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].voters[socket.id] = { name };
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]);
    await saveRooms();
    broadcastRooms();
  },

  openRoom: async (socket, { roomId, name }) => {
    console.log("Voter joined:", roomId, name);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].viewers[socket.id] = { name };

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]);
    await saveRooms();
    broadcastRooms();
  },

  setTicket: async ({ roomId, ticket }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTicket = ticket;
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;

      await saveRooms();

      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  },

  vote: async (socket, { roomId, vote }) => {
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
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  },

  requestRooms: (socket) => {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].voters).length
    }));
    socket.emit("roomsList", roomList);
  },

  leaveRoom: (socket, { roomId }) => {
    removeUserFromRoom(rooms, roomId, socket, saveRooms);
  },

  resetVotes:  async ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].showVotes = false;
      await saveRooms();
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  },

// When a player leaves
disconnect:  async (socket) => {
  for (const roomId of Object.keys(rooms)) {
    const r = rooms[roomId];
    if (r && r.voters && r.voters[socket.id]) {
      delete r.voters[socket.id];
      delete r.viewers[socket.id];
      delete r.votes[socket.id];
      await saveRooms();
      broadcastRooms();
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  }
},
});