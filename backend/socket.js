const { v4: uuidv4 } = require("uuid");

const activeRooms = {};
const waitingQueue = {
  "2-player": [],
  "4-player": []
};
const socketToRoom = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Manual room creation
    socket.on("createRoom", ({ userId, username, gameType }, callback) => {
      const roomId = uuidv4();
      activeRooms[roomId] = {
        host: { userId, username, socketId: socket.id },
        players: [{ userId, username, socketId: socket.id }],
        gameType
      };
      socket.join(roomId);
      socketToRoom[socket.id] = roomId;

      callback({ success: true, roomId });
      console.log(`📦 Room ${roomId} created by ${username}`);
    });

    // Join existing room
    socket.on("joinRoom", ({ roomId, userId, username }, callback) => {
      const room = activeRooms[roomId];
      if (!room) return callback({ success: false, message: "Room not found" });

      room.players.push({ userId, username, socketId: socket.id });
      socket.join(roomId);
      socketToRoom[socket.id] = roomId;

      io.to(roomId).emit("roomUpdated", {
        roomId,
        players: room.players,
        gameType: room.gameType
      });

      const required = room.gameType === "2-player" ? 2 : 4;
      if (room.players.length === required) {
        io.to(roomId).emit("gameStart", {
          roomId,
          players: room.players,
          gameType: room.gameType
        });
        console.log(`🚀 Game started in room ${roomId}`);
      }

      callback({ success: true });
    });

    // Dice roll
    socket.on("rollDice", ({ roomId }) => {
      if (!roomId || !activeRooms[roomId]) return;
      const diceValue = Math.floor(Math.random() * 6) + 1;
      io.to(roomId).emit("diceRolled", { diceValue });
      console.log(`🎲 Dice rolled in room ${roomId}: ${diceValue}`);
    });

    // Pawn move
    socket.on("pawnMove", ({ id, index }) => {
      const roomId = socketToRoom[socket.id];
      if (roomId) socket.to(roomId).emit("pawnMoved", { id, index });
    });

    // Game ended
    socket.on("endGame", ({ winnerId }) => {
      const roomId = socketToRoom[socket.id];
      if (roomId) {
        io.to(roomId).emit("gameEnded", { roomId, winnerId });
        delete activeRooms[roomId];
        console.log(`🏁 Game ended in room ${roomId}`);
      }
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      // Remove from queue
      for (const type of ["2-player", "4-player"]) {
        waitingQueue[type] = waitingQueue[type].filter(p => p.socketId !== socket.id);
      }

      const roomId = socketToRoom[socket.id];
      if (roomId && activeRooms[roomId]) {
        const room = activeRooms[roomId];
        room.players = room.players.filter(p => p.socketId !== socket.id);

        io.to(roomId).emit("playerLeft", { roomId });

        if (room.players.length === 0) {
          delete activeRooms[roomId];
          console.log(`🗑️ Room ${roomId} deleted`);
        }
      }

      delete socketToRoom[socket.id];
    });
  });
};
