const { v4: uuidv4 } = require("uuid");
const db = require("../models");

const waitingPlayers = {}; // { "2_100": [players], ... }
const activeRooms = {};
const roomColorMap = {}; // { roomCode: { red: userId, blue: userId, ... } }
const AVAILABLE_COLORS = ["red", "green", "yellow", "blue"];

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // ==== JOIN MATCH ====
    socket.on("join_match", async (data) => {
      try {
        const { userId, name, avatar, points, players } = data;
        const key = `${players}_${points}`;
        console.log(`🎯 join_match: ${name} → ${key}`);

        const player = {
          socketId: socket.id,
          userId,
          name,
          avatar,
          points,
          selectedColor: null,
        };

        if (!waitingPlayers[key]) waitingPlayers[key] = [];
        const alreadyInQueue = waitingPlayers[key].some((p) => p.userId === userId);
        if (alreadyInQueue) return;

        waitingPlayers[key].push(player);

        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };

        waitingPlayers[key].forEach((p) =>
          io.to(p.socketId).emit("match_update", updatePayload)
        );

        // ==== Enough players found ====
        if (waitingPlayers[key].length >= players) {
          const uniqueUsers = [];
          const seenUserIds = new Set();

          for (const p of waitingPlayers[key]) {
            if (!seenUserIds.has(p.userId)) {
              uniqueUsers.push(p);
              seenUserIds.add(p.userId);
            }
            if (uniqueUsers.length === players) break;
          }

          if (uniqueUsers.length === players) {
            const roomCode = `room_${Date.now()}`;

            // ==== DB: Create GameRoom ====
            const dbRoom = await db.GameRoom.create({
              roomCode,
              status: "started",
              gameType: "standard",
              playerCount: players,
            });

            // ==== DB: Add players ====
            for (const u of uniqueUsers) {
              await db.GamePlayer.create({
                roomId: dbRoom.id,
                userId: u.userId,
                isAI: false,
              });
            }

            console.log(
              `🛠️ Created room: ${roomCode} (DB id: ${dbRoom.id}) with players:`,
              uniqueUsers.map((p) => p.userId)
            );

            roomColorMap[roomCode] = {};

            // ==== Join sockets & notify ====
            uniqueUsers.forEach((p) => {
              const playerSocket = io.sockets.sockets.get(p.socketId);
              if (playerSocket) {
                playerSocket.join(roomCode);
              }
              io.to(p.socketId).emit("color_selection_start", {
                roomId: roomCode,
                availableColors: AVAILABLE_COLORS,
                players: uniqueUsers.map((mp) => ({
                  id: mp.userId,
                  name: mp.name,
                  avatar: mp.avatar,
                  points: mp.points,
                })),
              });
            });

            // ==== In-memory active room ====
            activeRooms[roomCode] = {
              dbRoomId: dbRoom.id,
              players: uniqueUsers.map((p) => ({
                id: p.userId,
                name: p.name,
                avatar: p.avatar,
                points: p.points,
                socketId: p.socketId,
                color: null,
              })),
              currentTurnIndex: 0,
              positions: {
                red: [0, 0, 0, 0],
                green: [0, 0, 0, 0],
                yellow: [0, 0, 0, 0],
                blue: [0, 0, 0, 0],
              },
            };

            waitingPlayers[key] = waitingPlayers[key].filter(
              (p) => !seenUserIds.has(p.userId)
            );

            // ==== Auto-assign colors after 5s ====
            setTimeout(() => {
              const colorMap = roomColorMap[roomCode];
              const assignedColors = Object.keys(colorMap);
              const available = AVAILABLE_COLORS.filter(
                (c) => !assignedColors.includes(c)
              );

              activeRooms[roomCode].players.forEach((p) => {
                if (!p.color && available.length > 0) {
                  const chosen = available.shift();
                  p.color = chosen;
                  colorMap[chosen] = p.id;
                  io.to(roomCode).emit("color_update", {
                    userId: p.id,
                    color: chosen,
                    roomId: roomCode,
                    takenColors: Object.keys(colorMap),
                  });
                }
              });

              // ==== Match found event ====
              if (activeRooms[roomCode]?.players.every((p) => p.color)) {
                activeRooms[roomCode].players.forEach((p) => {
                  io.to(p.socketId).emit("match_found", {
                    roomId: roomCode,
                    players: activeRooms[roomCode].players.map((mp) => ({
                      id: mp.id,
                      name: mp.name,
                      avatar: mp.avatar,
                      points: mp.points,
                      color: mp.color,
                    })),
                  });
                });

                const firstTurnPlayer = activeRooms[roomCode].players[0];
                io.to(roomCode).emit("turn_changed", {
                  playerId: firstTurnPlayer.id,
                });
              }
            }, 5000);
          }
        }
      } catch (err) {
        console.error("join_match error:", err);
        io.to(socket.id).emit("match_error", { message: "Internal server error" });
      }
    });

    // ==== SELECT COLOR ====
    socket.on("select_color", ({ roomId, userId, color }) => {
      if (!AVAILABLE_COLORS.includes(color)) return;
      if (!roomColorMap[roomId]) return;

      const colorAlreadyTaken = Object.keys(roomColorMap[roomId]).includes(color);
      if (colorAlreadyTaken) return;

      roomColorMap[roomId][color] = userId;
      const room = activeRooms[roomId];
      if (room) {
        room.players = room.players.map((p) =>
          p.id === userId ? { ...p, color } : p
        );

        io.to(roomId).emit("color_update", {
          userId,
          color,
          roomId,
          takenColors: Object.keys(roomColorMap[roomId]),
        });
      }
    });

    // ==== GET ROOM INFO ====
    socket.on("get_room_info", ({ roomId }) => {
      const room = activeRooms[roomId];
      if (room) {
        socket.join(roomId);
        io.to(socket.id).emit("room_info", {
          roomId,
          players: room.players,
          you: room.players.find((p) => p.socketId === socket.id),
        });
         // 🔥 send current turn again (fix for refresh)

         const current = room.players[room.currentTurnIndex];

         if (current) {
 
           io.to(socket.id).emit("turn_update", { playerId: current.id });
 
         }
      } else {
        io.to(socket.id).emit("room_info", { roomId, players: [], you: null });
      }
    });

    // ==== LEAVE QUEUE ====
    socket.on("leave_queue", ({ userId }) => {
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter(
          (p) => p.userId !== userId
        );

        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach((p) =>
          io.to(p.socketId).emit("match_update", updatePayload)
        );
      });
    });

    // ==== ROLL DICE ====
    socket.on("roll_dice", ({ roomId, playerId }) => {
      const room = activeRooms[roomId];
      if (!room) return;

      const currentPlayer = room.players[room.currentTurnIndex];

      if (currentPlayer.id !== playerId) {
        io.to(socket.id).emit("dice_error", { message: "Not your turn!" });
        return;
      }

      const diceValue = Math.floor(Math.random() * 6) + 1;
      io.to(roomId).emit("dice_rolled", { playerId, value: diceValue });

      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
      const nextPlayer = room.players[room.currentTurnIndex];
      io.to(roomId).emit("turn_update", { playerId: nextPlayer.id });
    });

    // ==== DISCONNECT ====
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter(
          (p) => p.socketId !== socket.id
        );

        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach((p) =>
          io.to(p.socketId).emit("match_update", updatePayload)
        );
      });
    });
  });
};
