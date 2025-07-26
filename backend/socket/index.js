const { v4: uuidv4 } = require("uuid");
const db = require("../models");
//nxnjnnsk
const waitingPlayers = {}; // { "2_100": [players], ... }
const activeRooms = {};
const roomColorMap = {}; // { roomCode: { red: userId, blue: userId, ... } }
const AVAILABLE_COLORS = ["red", "green", "yellow", "blue"];
const ruleEngine = require("../rules/ruleEngine");  // plceholder

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // ===================== JOIN MATCH =====================
    socket.on("join_match", async (data) => {
      try {
        const { userId, name, avatar, points, players } = data;
        const key = `${players}_${points}`;
        console.log(`🎯 join_match: ${name} → ${key}`);

        const player = { socketId: socket.id, userId, name, avatar, points, selectedColor: null };

        if (!waitingPlayers[key]) waitingPlayers[key] = [];
        if (waitingPlayers[key].some((p) => p.userId === userId)) return;

        waitingPlayers[key].push(player);

        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));

        // Enough players?
        if (waitingPlayers[key].length >= players) await createRoom(io, key, players);
      } catch (err) {
        console.error("join_match error:", err);
        io.to(socket.id).emit("match_error", { message: "Internal server error" });
      }
    });

    // ===================== SELECT COLOR =====================
    socket.on("select_color", ({ roomId, userId, color }) => {
      if (!AVAILABLE_COLORS.includes(color) || !roomColorMap[roomId]) return;
      if (roomColorMap[roomId][color]) return; // already taken

      roomColorMap[roomId][color] = userId;

      const room = activeRooms[roomId];
      if (!room) return;

      room.players = room.players.map((p) => (p.id === userId ? { ...p, color } : p));

      io.to(roomId).emit("color_update", {
        userId,
        color,
        roomId,
        takenColors: Object.keys(roomColorMap[roomId]),
      });
    });

    // ===================== GET ROOM INFO =====================
    socket.on("get_room_info", ({ roomId }) => {
      const room = activeRooms[roomId];
      if (!room) {
        io.to(socket.id).emit("room_info", { roomId, players: [], you: null });
        return;
      }

      socket.join(roomId);
      io.to(socket.id).emit("room_info", {
        roomId,
        players: room.players,
        you: room.players.find((p) => p.socketId === socket.id),
      });

      const current = room.players[room.currentTurnIndex];
      if (current) io.to(socket.id).emit("turn_update", { playerId: current.id });
    });

    // ===================== LEAVE QUEUE =====================
    socket.on("leave_queue", ({ userId }) => {
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter((p) => p.userId !== userId);
        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));
      });
    });

    // ===================== ROLL DICE =====================
    socket.on("roll_dice", ({ roomId, playerId }) => {
      const room = activeRooms[roomId];
      if (!room) return;

      const currentPlayer = room.players[room.currentTurnIndex];
      if (currentPlayer.id !== playerId) {
        io.to(socket.id).emit("dice_error", { message: "Not your turn!" });
        return;
      }
      // stop user to dice roll multiple time without move 
      if (room.hasRolledDice[currentPlayer.id]) {
        io.to(socket.id).emit("dice_error", { message: "You have already rolled the dice!" });
        return;
      }

      const diceValue = Math.floor(Math.random() * 6) + 1;
      // -- six count logic -----
      if (!room.sixCount) room.sixCount = {};
      if (!room.sixCount[playerId]) room.sixCount[playerId] = 0;
      if (diceValue === 6) {
        room.sixCount[playerId] += 1;
      } else {
        room.sixCount[playerId] = 0; // reset on non-six roll
      }

      room.lastDiceValue = diceValue;
      room.hasRolledDice[currentPlayer.id] = true; 

      io.to(roomId).emit("dice_rolled", { playerId, value: diceValue, rollId: Date.now() });

      // ---- AUTO MOVE IF SINGLE PAWN ----
      const moved = autoMoveIfSinglePawn(io, roomId, room, currentPlayer, diceValue);
      if (moved) return;

      const playerPositions = room.positions[currentPlayer.color];
      const allHome = playerPositions.every(pos => pos === 0);

      if (room.sixCount[playerId] >= 3) {
        room.sixCount[playerId] = 0; 
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
        room.hasRolledDice[currentPlayer.id] = false;
        room.lastDiceValue = 0;
        io.to(roomId).emit("turn_changed", { playerId: room.players[room.currentTurnIndex].id });
        return; 
      }

      if (allHome && diceValue !== 6) {
        // --- no possible move, skip turn ---
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
        room.hasRolledDice[currentPlayer.id] = false; 
        room.lastDiceValue = 0; 
        const nextPlayer = room.players[room.currentTurnIndex];
        io.to(roomId).emit("turn_changed", { playerId: nextPlayer.id });
        return; // stop further processing
      }
    });
// ------- piece move ----------
    socket.on("piece_moved", ({ roomId, color, pawnIndex }) => {
      const room = activeRooms[roomId];
      if (!room) return;

      const currentPlayer = room.players[room.currentTurnIndex];
      if (currentPlayer.color !== color) {
        io.to(socket.id).emit("move_error", { message: "Not your turn!" });
        return;
      }

      if (!room.hasRolledDice[currentPlayer.id]) {
        io.to(socket.id).emit("move_error", { message: "Roll the dice first!" });
        return;
      }

      const dice = room.lastDiceValue;
      if (!dice) {
        io.to(socket.id).emit("move_error", { message: "Invalid dice value" });
        return;
      }

      const result = ruleEngine.movePiece(room, color, pawnIndex, dice);

    // Agar move valid hai → dice reset karo
    if (!result.error) {
        room.hasRolledDice[currentPlayer.id] = false;
        room.lastDiceValue = 0;
        room.positions = result.positions;

        io.to(roomId).emit("position_update", room.positions);

        if (result.won) {
            room.isGameOver = true;
            io.to(roomId).emit("game_over", { winner: currentPlayer, positions: room.positions });
            return;
        }

        if (!result.extraTurnRequired) {
            room.currentTurnIndex = result.nextTurnIndex;
            io.to(roomId).emit("turn_changed", { playerId: room.players[room.currentTurnIndex].id });
        }
    } else {
        io.to(socket.id).emit("move_error", { message: result.error });

        // Overshoot case → agar turn force change karni hai to hi dice reset karo
        if (result.forceNextTurn) {
            room.hasRolledDice[currentPlayer.id] = false;
            room.lastDiceValue = 0;
            room.currentTurnIndex = result.nextTurnIndex;
            io.to(roomId).emit("turn_changed", { playerId: room.players[room.currentTurnIndex].id });
        }
        // otherwise dice wahi rahega → user dusra pawn move kar sakega
    }
});
    // ===================== DISCONNECT =====================
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      Object.keys(waitingPlayers).forEach((key) => {
        waitingPlayers[key] = waitingPlayers[key].filter((p) => p.socketId !== socket.id);
        const updatePayload = {
          players: waitingPlayers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingPlayers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));
      });
    });
  });
};

// ===================== CREATE ROOM =====================
async function createRoom(io, key, playersCount) {
  const uniqueUsers = [];
  const seenUserIds = new Set();
  for (const p of waitingPlayers[key]) {
    if (!seenUserIds.has(p.userId)) {
      uniqueUsers.push(p);
      seenUserIds.add(p.userId);
    }
    if (uniqueUsers.length === playersCount) break;
  }
  if (uniqueUsers.length !== playersCount) return;

  const roomCode = `room_${Date.now()}`;
  const dbRoom = await db.GameRoom.create({ roomCode, status: "started", gameType: "standard", playerCount: playersCount });

  for (const u of uniqueUsers) await db.GamePlayer.create({ roomId: dbRoom.id, userId: u.userId, isAI: false });

  roomColorMap[roomCode] = {};
  uniqueUsers.forEach((p) => {
    const playerSocket = io.sockets.sockets.get(p.socketId);
    if (playerSocket) playerSocket.join(roomCode);
    io.to(p.socketId).emit("color_selection_start", {
      roomId: roomCode,
      availableColors: AVAILABLE_COLORS,
      players: uniqueUsers.map((mp) => ({ id: mp.userId, name: mp.name, avatar: mp.avatar, points: mp.points })),
    });
  });

  activeRooms[roomCode] = {
    dbRoomId: dbRoom.id,
    players: uniqueUsers.map((p) => ({ 
      id: p.userId, 
      name: p.name, 
      avatar: p.avatar, 
      points: p.points, 
      socketId: p.socketId, 
      color: null })),
    currentTurnIndex: 0,
    positions: { 
      red: [0, 0, 0, 0], 
      green: [0, 0, 0, 0], 
      yellow: [0, 0, 0, 0], 
      blue: [0, 0, 0, 0] },
      lastDiceValue: 0,
      hasRolledDice: {}
  };

  waitingPlayers[key] = waitingPlayers[key].filter((p) => !seenUserIds.has(p.userId));

  setTimeout(() => autoAssignColors(io, roomCode), 5000);
}

function autoAssignColors(io, roomCode) {
  const colorMap = roomColorMap[roomCode];
  const available = AVAILABLE_COLORS.filter((c) => !colorMap[c]);
  activeRooms[roomCode].players.forEach((p) => {
    if (!p.color && available.length > 0) {
      const chosen = available.shift();
      p.color = chosen;
      colorMap[chosen] = p.id;
      io.to(roomCode).emit("color_update", { userId: p.id, color: chosen, roomId: roomCode, takenColors: Object.keys(colorMap) });
    }
  });

  if (activeRooms[roomCode].players.every((p) => p.color)) {
    activeRooms[roomCode].players.forEach((p) => io.to(p.socketId).emit("match_found", {
      roomId: roomCode,
      players: activeRooms[roomCode].players.map((mp) => ({ id: mp.id, name: mp.name, avatar: mp.avatar, points: mp.points, color: mp.color })),
    }));
    io.to(roomCode).emit("turn_changed", { playerId: activeRooms[roomCode].players[0].id });
  }
}

// ===================== AUTO MOVE HELPER =====================
function autoMoveIfSinglePawn(io, roomId, room, currentPlayer, diceValue) {
  const positions = room.positions[currentPlayer.color];

  const pawnsOnBoard = positions.filter(p => p > 0 && p !== 999);
  const homePawns = positions.filter(p => p === 0);

  // ==== Case 1: Agar home me pawn hai aur dice 6 hai -> Choice dena, auto move mat karo
  if (homePawns.length > 0 && diceValue === 6) {
    return false; // player khud decide karega
  }

  // ==== Case 2: Agar sirf ek pawn board pe hai (aur dice koi bhi ho) aur nikalne ke liye home me kuch nahi bacha
  if (pawnsOnBoard.length === 1 && (diceValue !== 6 || homePawns.length === 0)) {
    const pawnIndex = positions.findIndex(p => p > 0 && p !== 999);
    const result = ruleEngine.movePiece(room, currentPlayer.color, pawnIndex, diceValue);

    room.hasRolledDice[currentPlayer.id] = false;
    room.lastDiceValue = 0;

    if (!result.error) {
      room.positions = result.positions;
      io.to(roomId).emit("position_update", room.positions);

      if (result.won) {
        room.isGameOver = true;
        io.to(roomId).emit("game_over", { winner: currentPlayer, positions: room.positions });
        return true;
      }

      if (!result.extraTurnRequired) {
        room.currentTurnIndex = result.nextTurnIndex;
        io.to(roomId).emit("turn_changed", { playerId: room.players[room.currentTurnIndex].id });
      }
      return true;
    } else {
      room.currentTurnIndex = result.nextTurnIndex;
      io.to(roomId).emit("turn_changed", { playerId: room.players[room.currentTurnIndex].id });
      return true;
    }
  }

  return false;
}

