function startTurnTimer(io, roomId, activeRooms, handleSkip) {
    const room = activeRooms[roomId];
    if (!room) return;
  
    clearTimeout(room.turnTimer);
    clearInterval(room.turnCountdown);
  
    const currentUser = room.users[room.currentTurnIndex];
    if (!currentUser) return;
  
    let remaining = 30;
    io.to(roomId).emit("turn_timer", { userId: currentUser.id, remaining });
    room.turnRemaining = remaining;
  
    room.turnCountdown = setInterval(() => {
      remaining -= 1;
      io.to(roomId).emit("turn_timer", { userId: currentUser.id, remaining });
      room.turnRemaining = remaining;
    }, 1000);
  
    room.turnTimer = setTimeout(() => {
      clearInterval(room.turnCountdown);
      handleSkip(io, roomId, currentUser.id, activeRooms);
    }, 30000);
  }
  
  function handleSkip(io, roomId, userId, activeRooms) {
    const room = activeRooms[roomId];
    if (!room) return;
  
    clearTimeout(room.turnTimer);
    clearInterval(room.turnCountdown);
  
    room.skipCount[userId] = (room.skipCount[userId] || 0) + 1;
    io.to(roomId).emit("user_skipped", { userId, skipCount: room.skipCount[userId] });
  
    if (room.skipCount[userId] >= 3) {
      const kickedUser = room.users.find((p) => p.id === userId);
      if (kickedUser?.color) room.positions[kickedUser.color] = [0, 0, 0, 0];
      room.users = room.users.filter((p) => p.id !== userId);
  
      io.to(roomId).emit("position_update", room.positions);
      io.to(roomId).emit("user_kicked", { userId });
  
      if (room.users.length === 1) {
        io.to(roomId).emit("game_over", { winner: room.users[0], positions: room.positions });
        room.isGameOver = true;
        return;
      }
  
      room.currentTurnIndex = room.currentTurnIndex % room.users.length;
    } else {
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
    }
  
    io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
    startTurnTimer(io, roomId, activeRooms, handleSkip);
  }
  
  module.exports = { startTurnTimer, handleSkip };
  