const { createRoom } = require("../helpers/roomUtils");
const { AVAILABLE_COLORS, waitingUsers, roomColorMap, activeRooms } = require("../state");

module.exports = (io, socket) => {
  socket.on("join_match", async (data) => {
    try {
      const { userId, name, avatar, points, users } = data;
      const key = `${users}_${points}`;
      console.log(`🎯 join_match: ${name} → ${key}`);

      const User = { socketId: socket.id, userId, name, avatar, points, selectedColor: null };
      if (!waitingUsers[key]) waitingUsers[key] = [];
      if (waitingUsers[key].some((p) => p.userId === userId)) return;

      waitingUsers[key].push(User);

      const updatePayload = {
        users: waitingUsers[key].map((p) => ({
          userId: p.userId,
          name: p.name,
          avatar: p.avatar || "👤",
          selectedColor: p.selectedColor
        }))
      };
      waitingUsers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));

      if (waitingUsers[key].length >= users) await createRoom(io, key, users, waitingUsers);
    } catch (err) {
      console.error("join_match error:", err);
      io.to(socket.id).emit("match_error", { message: "Internal server error" });
    }
  });

  socket.on("select_color", ({ roomId, userId, color }) => {
    if (!AVAILABLE_COLORS.includes(color) || !roomColorMap[roomId]) return;
    if (roomColorMap[roomId][color]) return;

    roomColorMap[roomId][color] = userId;
    const room = activeRooms[roomId];
    if (!room) return;

    room.users = room.users.map((p) => (p.id === userId ? { ...p, color } : p));
    io.to(roomId).emit("color_update", {
      userId,
      color,
      roomId,
      takenColors: Object.keys(roomColorMap[roomId])
    });
  });

  socket.on("leave_queue", ({ userId }) => {
    Object.keys(waitingUsers).forEach((key) => {
      waitingUsers[key] = waitingUsers[key].filter((p) => p.userId !== userId);
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
