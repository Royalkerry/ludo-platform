const waitingPlayers = {}; // e.g., { "2_100": [...players], "4_200": [...] }
const activeRooms = {};
const roomColorMap = {}; // { roomId: { red: userId, blue: userId, ... } }

const AVAILABLE_COLORS = ["red", "green", "yellow", "blue"];

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("join_match", (data) => {
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

      const alreadyInQueue = waitingPlayers[key].some(p => p.userId === userId);
      if (alreadyInQueue) return;

      waitingPlayers[key].push(player);

      const updatePayload = {
        players: waitingPlayers[key].map(p => ({
          userId: p.userId,
          name: p.name,
          avatar: p.avatar || "👤",
          selectedColor: p.selectedColor,
        })),
      };

      waitingPlayers[key].forEach(p =>
        io.to(p.socketId).emit("match_update", updatePayload)
      );

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
          const roomId = `room_${Date.now()}`;
          console.log(`🛠️ Created room: ${roomId} with players:`, uniqueUsers.map(p => p.userId));
          roomColorMap[roomId] = {};

          // Join players to the room
          uniqueUsers.forEach(p => {
            const playerSocket = io.sockets.sockets.get(p.socketId);
            if (playerSocket) {
              playerSocket.join(roomId);
            }
            io.to(p.socketId).emit("color_selection_start", {
              roomId,
              availableColors: AVAILABLE_COLORS,
              players: uniqueUsers.map(mp => ({
                id: mp.userId,
                name: mp.name,
                avatar: mp.avatar,
                points: mp.points,
              })),
            });
          });

          //update: Room state add kiya with positions + starting turn
          activeRooms[roomId] = {
            players: uniqueUsers.map(p => ({
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
            p => !seenUserIds.has(p.userId)
          );

          // Auto-assign colors after 5 seconds
          setTimeout(() => {
            const colorMap = roomColorMap[roomId];
            const assignedColors = Object.keys(colorMap);
            const available = AVAILABLE_COLORS.filter(c => !assignedColors.includes(c));

            activeRooms[roomId].players.forEach(p => {
              if (!p.color && available.length > 0) {
                const chosen = available.shift();
                p.color = chosen;
                colorMap[chosen] = p.id;
                io.to(roomId).emit("color_update", {
                  userId: p.id,
                  color: chosen,
                  roomId,
                  takenColors: Object.keys(colorMap),
                });
              }
            });

            //update: Match found hone ke baad first turn emit
            if (activeRooms[roomId]?.players.every(p => p.color)) {
              activeRooms[roomId].players.forEach(p => {
                io.to(p.socketId).emit("match_found", {
                  roomId,
                  players: activeRooms[roomId].players.map(mp => ({
                    id: mp.id,
                    name: mp.name,
                    avatar: mp.avatar,
                    points: mp.points,
                    color: mp.color,
                  })),
                });
              });

              const firstTurnPlayer = activeRooms[roomId].players[0];
              io.to(roomId).emit("turn_changed", { playerId: firstTurnPlayer.id });
            }
          }, 5000);
        }
      }
    });

    socket.on("select_color", ({ roomId, userId, color }) => {
      if (!AVAILABLE_COLORS.includes(color)) return;
      if (!roomColorMap[roomId]) return;

      const colorAlreadyTaken = Object.keys(roomColorMap[roomId]).includes(color);
      if (colorAlreadyTaken) return;

      roomColorMap[roomId][color] = userId;

      const room = activeRooms[roomId];
      if (room) {
        room.players = room.players.map(p =>
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

    socket.on("get_room_info", ({ roomId }) => {
      const room = activeRooms[roomId];
      if (room) {
        socket.join(roomId);
        io.to(socket.id).emit("room_info", {
          roomId,
          players: room.players,
          you: room.players.find(p => p.socketId === socket.id),
        });
      } else {
        io.to(socket.id).emit("room_info", { roomId, players: [], you: null});
      }
    });

    socket.on("leave_queue", ({ userId }) => {
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter(p => p.userId !== userId);

        const updatePayload = {
          players: waitingPlayers[key].map(p => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach(p =>
          io.to(p.socketId).emit("match_update", updatePayload)
        );
      });
    });

    //update: Dice roll logic + turn validation
    socket.on("roll_dice", ({ roomId, playerId }) => {
      const room = activeRooms[roomId];
      if (!room) return;

      const currentPlayer = room.players[room.currentTurnIndex];
      if (currentPlayer.id !== playerId) {
        io.to(socket.id).emit("error", { message: "Not your turn!" });
        return;
      }

      const diceValue = Math.floor(Math.random() * 6) + 1;
      io.to(roomId).emit("dice_rolled", { playerId, value: diceValue });

      // turn change
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
      const nextPlayer = room.players[room.currentTurnIndex];
      io.to(roomId).emit("turn_changed", { playerId: nextPlayer.id });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter(
          (p) => p.socketId !== socket.id
        );

        const updatePayload = {
          players: waitingPlayers[key].map(p => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach(p =>
          io.to(p.socketId).emit("match_update", updatePayload)
        );
      });
    });
  });
};
