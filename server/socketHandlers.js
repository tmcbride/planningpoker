async function removeUserFromRoom(rooms, roomId, socket) {
  if (!rooms) return;
  const r = rooms[roomId];
  if (r.users[socket.id]) {
    delete r.users[socket.id];
    delete r.votes[socket.id];
    await saveRooms();
  }
}

module.exports = (io, rooms, saveRooms, broadcastRooms) => ({
  createRoom: async (socket, { roomId, dealer }) => {
    rooms[roomId] = { dealer, users: {}, votes: {}, showVotes: false };
    rooms[roomId].users[socket.id] = { name: dealer, role: "dealer" };
    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    broadcastRooms();
  },

  joinRoom: async (socket, { roomId, name }) => {
    console.log("User joined:", roomId, name);

    if (!rooms[roomId]) return;
    socket.join(roomId);
    rooms[roomId].users[socket.id] = { name, role: "player" };
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    socket.emit("roomUpdate", rooms[roomId]); // Ensure joining user gets update
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
  },

  requestRooms: (socket) => {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].users).length
    }));
    socket.emit("roomsList", roomList);
  },

  leaveRoom: (socket, { roomId }) => {
    removeUserFromRoom(rooms, roomId, socket);
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
    if (r.users[socket.id]) {
      delete r.users[socket.id];
      delete r.votes[socket.id];
      if (Object.keys(r.users).length === 0) delete rooms[roomId];
      await saveRooms();
      broadcastRooms();
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  }
},
});