const { activeRooms } = require("../state");

module.exports = (io, socket) => {
  socket.on("get_room_info", ({ roomId }) => {
    const room = activeRooms[roomId];
    if (!room) {
      io.to(socket.id).emit("room_info", { roomId, users: [], you: null });
      return;
    }
    socket.join(roomId);
    io.to(socket.id).emit("room_info", {
      roomId,
      users: room.users,
      you: room.users.find((p) => p.socketId === socket.id)
    });

    const current = room.users[room.currentTurnIndex];
    if (current) io.to(socket.id).emit("turn_update", { userId: current.id });
  });

  socket.on("check_active_room", ({ userId }) => {
    let userRoomId = null;
    for (const [roomId, room] of Object.entries(activeRooms)) {
      const foundUser = room.users.find((u) => u.id === userId);
      if (foundUser && !room.isGameOver) {
        userRoomId = roomId;
        break;
      }
    }
    if (userRoomId) socket.emit("active_room_found", { roomId: userRoomId });
    else socket.emit("no_active_room");
  });
};
