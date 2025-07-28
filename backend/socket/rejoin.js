module.exports = function handleRejoin(io, socket, activeRooms, roomColorMap) {
  socket.on("rejoin_request", ({ userId }) => {
    console.log(`🔄 Rejoin request from ${userId}`);

    let userRoomId = null;
    let userData = null;

    // Find the room and user data
    for (const [roomId, room] of Object.entries(activeRooms)) {
      const foundUser = room.users.find((u) => u.id === userId);
      if (foundUser) {
        userRoomId = roomId;
        userData = foundUser;
        foundUser.socketId = socket.id; // update socket ID
        break;
      }
    }

    if (!userRoomId || !userData) {
      io.to(socket.id).emit("rejoin_failed", { message: "No active game found" });
      return;
    }
   

  
    const room = activeRooms[userRoomId];
    if (!room || room.isGameOver) {
      return io.to(socket.id).emit("rejoin_failed", {message: "Game already finished"});
    }

    socket.join(userRoomId);

    // --- Safe current turn user with fallback ---
    let currentTurnUser = null;
    if (
      typeof room.currentTurnIndex === "number" &&
      room.currentTurnIndex >= 0 &&
      room.currentTurnIndex < room.users.length
    ) {
      currentTurnUser = room.users[room.currentTurnIndex];
    }
    if (!currentTurnUser) currentTurnUser = room.users[0];

    // --- Send all room info to rejoining user ---
    io.to(socket.id).emit("room_info", {
      roomId: userRoomId,
      users: room.users,
      you: userData,
    });

    io.to(socket.id).emit("position_update", room.positions);

    io.to(socket.id).emit("turn_update", { userId: currentTurnUser.id });
    io.to(socket.id).emit("turn_timer", {
      userId: currentTurnUser.id,
      remaining: room.turnRemaining || 30,
    });

    io.to(socket.id).emit("color_update", {
      userId: userData.id,
      color: userData.color,
      roomId: userRoomId,
      takenColors: Object.keys(roomColorMap[userRoomId] || {}),
    });

    // --- Handle game over ---
    if (room.isGameOver) {
      io.to(socket.id).emit("game_over", {
        winner: room.users.find((u) => u.id !== userData.id) || userData,
        positions: room.positions,
      });
      return;
    }

    // --- Send skip counts ---
    Object.entries(room.skipCount || {}).forEach(([uid, count]) => {
      io.to(socket.id).emit("user_skipped", { userId: uid, skipCount: count });
    });

    console.log(`🔄 ${userData.name} rejoined ${userRoomId}`);
  });

  // --- API to send positions manually when requested (client rejoin helper) ---
  socket.on("get_positions", ({ roomId }) => {
    const room = activeRooms[roomId];
    if (room) {
      const currentTurnUser = room.users[room.currentTurnIndex] || room.users[0];
      io.to(socket.id).emit("position_update", room.positions);
      io.to(socket.id).emit("turn_update", { userId: currentTurnUser.id });
      io.to(socket.id).emit("turn_timer", {
        userId: currentTurnUser.id,
        remaining: room.turnRemaining || 30,
      });
    }
  });
};
