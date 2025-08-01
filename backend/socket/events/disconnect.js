const { activeRooms, waitingUsers } = require("../state");

module.exports = (io, socket) => {
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    for (const [roomId, room] of Object.entries(activeRooms)) {
      const foundUser = room.users.find((u) => u.socketId === socket.id);
      if (foundUser) {
        foundUser.disconnected = true;
        break;
      }
    }
    Object.keys(waitingUsers).forEach((key) => {
      waitingUsers[key] = waitingUsers[key].filter((p) => p.socketId !== socket.id);
      const updatePayload = {
        users: waitingUsers[key].map((p) => ({
          userId: p.userId,
          name: p.name,
          avatar: p.avatar || "👤",
          selectedColor: p.selectedColor
        }))
      };
      waitingUsers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));
    });
  });
};
