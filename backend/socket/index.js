const { v4: uuidv4 } = require("uuid");
const db = require("../models");

const activeRooms = {};
const waitingQueue = {
  "2-player": [],
  "4-player": []
};
const gameStartTimeouts = {};
const socketToRoom = {}; // socket.id → roomId

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // ========== JOIN QUEUE FOR MATCHMAKING ==========
    socket.on("joinGame", ({ userId, username, gameType }) => {
      if (!["2-player", "4-player"].includes(gameType)) return;

      const player = { socketId: socket.id, userId, username };
      waitingQueue[gameType].push(player);

      const required = gameType === "2-player" ? 2 : 4;

      if (waitingQueue[gameType].length >= required) {
        const matched = waitingQueue[gameType].splice(0, required);
        const roomId = uuidv4();

        activeRooms[roomId] = {
          players: matched,
          gameType
        };

        matched.forEach((p) => {
          socketToRoom[p.socketId] = roomId;
          io.to(p.socketId).emit("gameMatched", {
            roomId,
            players: matched.map((m) => ({ userId: m.userId, username: m.username })),
            gameType
          });
        });

        console.log(`🎮 Match created: Room ${roomId}`);
      }
    });

    // ========== MANUAL ROOM CREATION ==========
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

    socket.on("joinRoom", ({ roomId, userId, username }, callback) => {
      const room = activeRooms[roomId];
      if (!room) return callback({ success: false, message: "Room not found" });

      if (room.players.find((p) => p.userId === userId)) return;

      room.players.push({ userId, username, socketId: socket.id });
      socket.join(roomId);
      socketToRoom[socket.id] = roomId;

      io.to(roomId).emit("roomUpdated", {
        roomId,
        players: room.players,
        gameType: room.gameType
      });

      console.log(`🧑‍🤝‍🧑 ${username} joined room ${roomId}`);

      const required = room.gameType === "2-player" ? 2 : 4;
      if (room.players.length === required) {
        clearTimeout(gameStartTimeouts[roomId]);
        delete gameStartTimeouts[roomId];

        io.to(roomId).emit("gameStart", {
          roomId,
          players: room.players.map((p) => ({
            userId: p.userId,
            username: p.username
          })),
          gameType: room.gameType
        });

        console.log(`🚀 Game started in room ${roomId}`);
      }

      callback({ success: true });
    });

    // ========== SYNC PAWN MOVES ==========
    socket.on("pawnMove", ({ id, index }) => {
      const roomId = socketToRoom[socket.id];
      if (!roomId) return;
      socket.to(roomId).emit("pawnMoved", { id, index });
    });

    // ========== DICE ROLL ==========
    socket.on("rollDice", ({ roomId }) => {
      if (!roomId || !activeRooms[roomId]) return;

      const diceValue = Math.floor(Math.random() * 6) + 1;
      io.to(roomId).emit("diceRolled", { diceValue });
      console.log(`🎲 Dice rolled in ${roomId}: ${diceValue}`);
    });

    // ========== GAME END ==========
    socket.on("endGame", async ({ roomId, players, winnerId, pointsWon, gameType }) => {
      try {
        await db.Game.create({
          roomId,
          players,
          winnerId,
          pointsWon,
          gameType,
          endedAt: new Date()
        });

        io.to(roomId).emit("gameEnded", { roomId, winnerId });
        console.log(`🏁 Game ${roomId} ended. Winner: ${winnerId}`);
      } catch (err) {
        console.error("❌ DB Save error:", err);
      }
    });

    // ========== DISCONNECT ==========
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      // Remove from matchmaking
      for (const type of ["2-player", "4-player"]) {
        waitingQueue[type] = waitingQueue[type].filter((p) => p.socketId !== socket.id);
      }

      const roomId = socketToRoom[socket.id];
      if (roomId) {
        const room = activeRooms[roomId];
        if (room) {
          room.players = room.players.filter((p) => p.socketId !== socket.id);
          io.to(roomId).emit("playerLeft", { roomId });

          if (room.players.length === 0) {
            delete activeRooms[roomId];
            console.log(`⛔ Room ${roomId} deleted`);
          }
        }

        socket.leave(roomId);
        delete socketToRoom[socket.id];
      }
    });
  });
};
