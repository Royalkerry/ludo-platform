const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const waitingUsers= {}; // { "2_100": [Users], ... }
const activeRooms = {};
const roomColorMap = {}; // { roomCode: { red: userId, blue: userId, ... } }
const AVAILABLE_COLORS = ["red", "green", "yellow", "blue"];
const ruleEngine = require("../rules/ruleEngine");  
const handleRejoin = require("./rejoin");

// ===================== TURN TIMER HELPERS =====================
function startTurnTimer(io, roomId) {
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


    if (remaining <= 0) { clearInterval(room.turnCountdown);
    }
  }, 1000);
  room.turnRemaining = remaining;

  room.turnTimer = setTimeout(() => {
    clearInterval(room.turnCountdown);
    handleSkip(io, roomId, currentUser.id);
  }, 30000);
}

//============ handle skip =============//
function handleSkip(io, roomId, userId) {
  const room = activeRooms[roomId];
  if (!room) return;

  clearTimeout(room.turnTimer);
  clearInterval(room.turnCountdown);

  room.skipCount[userId] = (room.skipCount[userId] || 0) + 1;
  io.to(roomId).emit("user_skipped", { userId, skipCount: room.skipCount[userId]});

  if (room.skipCount[userId] >= 3) {
    // ==== Remove User pawns from board ====
    const kickedUser = room.users.find(p => p.id === userId);
    if (kickedUser?.color) {
      room.positions[kickedUser.color] = [0, 0, 0, 0];}
    room.users = room.users.filter(p => p.id !== userId);

    io.to(roomId).emit("position_update", room.positions);
    io.to(roomId).emit("user_kicked", { userId });
    
//winner check
    if (room.users.length === 1) {
      io.to(roomId).emit("game_over", { winner: room.users[0], positions: room.positions });
      room.isGameOver = true;

      setTimeout(() => {
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (clients) {
          for (const clientId of clients) {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket) clientSocket.leave(roomId);
          }
        }
        // room delete करो
        delete activeRooms[roomId];
        delete roomColorMap[roomId];
        console.log(`🗑 Room ${roomId} destroyed after game over`);
      }, 5000); // 5 सेकंड delay ताकि client को final events मिल जाएं
      
      return;
    }

    // ==== Adjust turn index (skip removed User) ====
    room.currentTurnIndex = room.currentTurnIndex % room.users.length;

  } else {
    // ==== Simple skip turn ====
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
  }

  // ==== Start next User's turn ====
  io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
  startTurnTimer(io, roomId);
}

module.exports =(io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    handleRejoin(io, socket, activeRooms, roomColorMap);

    // ============= CHECK ACTIVE ROOM ============
socket.on("check_active_room", ({ userId }) => {
  let userRoomId = null;
  for (const [roomId, room] of Object.entries(activeRooms)) {
    const foundUser = room.users.find((u) => u.id === userId);
    if (foundUser && !room.isGameOver) {
      userRoomId = roomId;
      break;
    }
  }

  if (userRoomId) {
    socket.emit("active_room_found", { roomId: userRoomId, message: "You have an unfinished game." });
  } else {
    socket.emit("no_active_room");
  }
});

    

    // ===================== JOIN MATCH =====================
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
            selectedColor: p.selectedColor,
          })),
        };
        waitingUsers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));

        
        if (waitingUsers[key].length >= users) await createRoom(io, key, users);
      } catch (err) {
        console.error("join_match error:", err);
        io.to(socket.id).emit("match_error", { message: "Internal server error" });
      }
    });

    // ===================== SELECT COLOR =====================
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
        takenColors: Object.keys(roomColorMap[roomId]),
      });
    });

    // ===================== GET ROOM INFO =====================
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
        you: room.users.find((p) => p.socketId === socket.id),
      });

      const current = room.users[room.currentTurnIndex];
      if (current) io.to(socket.id).emit("turn_update", { userId: current.id });
    });

    // ===================== LEAVE QUEUE =====================
    socket.on("leave_queue", ({ userId }) => {
      Object.keys(waitingUsers).forEach((key) => {
        waitingUsers[key] = waitingUsers[key].filter((p) => p.userId !== userId);
        const updatePayload = {
          users: waitingUsers[key].map((p) => ({
            userId: p.userId,
            name: p.name,
            avatar: p.avatar || "👤",
            selectedColor: p.selectedColor,
          })),
        };
        waitingUsers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));
      });
    });

    // ===================== ROLL DICE =====================
    socket.on("roll_dice", ({ roomId, userId }) => {
      const room = activeRooms[roomId];
      if (!room || room.isGameOver) return; // changes 3:28- timer

      const currentUser = room.users[room.currentTurnIndex];
      if (currentUser.id !== userId) {
        io.to(socket.id).emit("dice_error", { message: "Not your turn!" });
        return;
      }
      // stop user to dice roll multiple time without move 
      if (room.hasRolledDice[currentUser.id]) {
        io.to(socket.id).emit("dice_error", { message: "You have already rolled the dice!" });
        return;
      }

      const diceValue = Math.floor(Math.random() * 6) + 1;
      // -- six count logic -----
      if (!room.sixCount) room.sixCount = {};
      if (!room.sixCount[userId]) room.sixCount[userId] = 0;
      if (diceValue === 6) {
        room.sixCount[userId] += 1;
      } else {
        room.sixCount[userId] = 0; // reset on non-six roll
      }

      room.lastDiceValue = diceValue;
      room.hasRolledDice[currentUser.id] = true;

      io.to(roomId).emit("dice_rolled", { userId, value: diceValue, rollId: Date.now() });

      //---- AUTO MOVE IF SINGLE PAWN ----
      const moved = autoMoveIfSinglePawn(io, roomId, room, currentUser, diceValue);
      if (moved) {
        startTurnTimer(io, roomId);
        return;
      }
        


      const userPositions = room.positions[currentUser.color];
      const allHome = userPositions.every(pos => pos === 0);

      if (room.sixCount[userId] >= 3) {
        room.sixCount[userId] = 0; 
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
        room.hasRolledDice[currentUser.id] = false;
        room.lastDiceValue = 0;
        io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
        
        startTurnTimer(io, roomId); // timmer added 
        return;
      }

      if (allHome && diceValue !== 6) {

        clearTimeout(room.turnTimer);
        clearInterval(room.turnCountdown);
        // --- no possible move, skip turn ---
        
        room.hasRolledDice[currentUser.id] = false; 
        room.lastDiceValue = 0; 

        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
        const nextUser = room.users[room.currentTurnIndex];
        io.to(roomId).emit("turn_changed", { userId: nextUser.id });

        startTurnTimer(io, roomId); 
        return; 
      }
    });
// ================ piece move ==================
    socket.on("piece_moved", ({ roomId, color, pawnIndex }) => {
      const room = activeRooms[roomId];
      if (!room || room.isGameOver)  return; // changes 3:28- timer

      const currentUser = room.users[room.currentTurnIndex];
      if (currentUser.color !== color) {
        io.to(socket.id).emit("move_error", { message: "Not your turn!" });
        return;
      }

      if (!room.hasRolledDice[currentUser.id]) {
        io.to(socket.id).emit("move_error", { message: "Roll the dice first!" });
        return;
      }

      const dice = room.lastDiceValue;
      if (!dice) {
        io.to(socket.id).emit("move_error", { message: "Invalid dice value" });
        return;
      }

      const result = ruleEngine.movePiece(room, color, pawnIndex, dice);

    //======== if not have valid move trun dice reset and change turn ========
    if (!result.error) {
        room.hasRolledDice[currentUser.id] = false;
        room.lastDiceValue = 0;
        room.positions = result.positions;

        io.to(roomId).emit("position_update", room.positions);

        if (result.won) {
            room.isGameOver = true;
            io.to(roomId).emit("game_over", { winner: currentUser, positions: room.positions });

            setTimeout(() => {
              // सभी socket को उस room से disconnect कर दो
              const clients = io.sockets.adapter.rooms.get(roomId);
              if (clients) {
                for (const clientId of clients) {
                  const clientSocket = io.sockets.sockets.get(clientId);
                  if (clientSocket) clientSocket.leave(roomId);
                }
              }
              // room delete करो
              delete activeRooms[roomId];
              delete roomColorMap[roomId];
              console.log(`🗑 Room ${roomId} destroyed after game over`);
            }, 5000); // 5 सेकंड delay ताकि client को final events मिल जाएं
            
            return;
        }

        if (!result.extraTurnRequired) {
            room.currentTurnIndex = result.nextTurnIndex;
            io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
            startTurnTimer(io, roomId); // timer added
        } else { 
          startTurnTimer(io, roomId); // timer reset is same User again
        
        }
    } else {
        io.to(socket.id).emit("move_error", { message: result.error });

        // Overshoot case → agar turn force change karni hai to hi dice reset karo
        if (result.forceNextTurn) {
            // room.hasRolledDice[currentUser.id] = false;
            // room.lastDiceValue = 0;
            room.currentTurnIndex = result.nextTurnIndex;
            io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
        startTurnTimer(io, roomId); // timer added
          }
    }
});
    // ===================== DISCONNECT =====================
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      
      for (const [roomId, room] of Object.entries(activeRooms)) {
        const foundUser = room.users.find((u) => u.socketId === socket.id);
        if(foundUser) {
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
            selectedColor: p.selectedColor,
          })),
        };
        waitingUsers[key].forEach((p) => io.to(p.socketId).emit("match_update", updatePayload));
      });
    });
  });
};

// ===================== CREATE ROOM =====================
async function createRoom(io, key, usersCount) {
  const uniqueUsers = [];
  const seenUserIds = new Set();
  for (const p of waitingUsers[key]) {
    if (!seenUserIds.has(p.userId)) {
      uniqueUsers.push(p);
      seenUserIds.add(p.userId);
    }
    if (uniqueUsers.length === usersCount) break;
  }
  if (uniqueUsers.length !== usersCount) return;

  const roomCode = `room_${Date.now()}`;
  const dbRoom = await db.GameRoom.create({ roomCode, status: "started", gameType: "standard", userCount: usersCount });

  for (const u of uniqueUsers) {
    await db.GameUser.create({ roomId: dbRoom.id, userId: u.userId, isAI: false });}

  roomColorMap[roomCode] = {};
  uniqueUsers.forEach((p) => {
    const userSocket = io.sockets.sockets.get(p.socketId);
    if (userSocket) userSocket.join(roomCode);
    io.to(p.socketId).emit("color_selection_start", {
      roomId: roomCode,
      availableColors: AVAILABLE_COLORS,
      users: uniqueUsers.map((mp) => ({ id: mp.userId, name: mp.name, avatar: mp.avatar, points: mp.points })),
    });
  });

  activeRooms[roomCode] = {
    dbRoomId: dbRoom.id,
    users: uniqueUsers.map((p) => ({ 
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
      hasRolledDice: {},
      skipCount: {},
      turnTimer: null,
      turnRemaining: 30
  };

  waitingUsers[key] = waitingUsers[key].filter((p) => !seenUserIds.has(p.userId));

  setTimeout(() => autoAssignColors(io, roomCode), 15000);
}

function autoAssignColors(io, roomCode) {
  const colorMap = roomColorMap[roomCode];
  const available = AVAILABLE_COLORS.filter((c) => !colorMap[c]);
  activeRooms[roomCode].users.forEach((p) => {
    if (!p.color && available.length > 0) {
      const chosen = available.shift();
      p.color = chosen;
      colorMap[chosen] = p.id;
      io.to(roomCode).emit("color_update", { userId: p.id, color: chosen, roomId: roomCode, takenColors: Object.keys(colorMap) });
    }
  });

  if (activeRooms[roomCode].users.every((p) => p.color)) {
    const room = activeRooms[roomCode];
    
    // --- Sort by color ---
    const colorOrder = ["blue", "red", "yellow", "green"]; // change colour acording to board 
    room.users.sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color));
  
    // Send final match found info (sorted order)
    room.users.forEach((p) =>
      io.to(p.socketId).emit("match_found", {
        roomId: roomCode,
        users: room.users.map((mp) => ({
          id: mp.id,
          name: mp.name,
          avatar: mp.avatar,
          points: mp.points,
          color: mp.color,
        })),
      })
    );
  
    // --- Start with Red player ---
    room.currentTurnIndex = 0;
    io.to(roomCode).emit("turn_changed", { userId: room.users[0].id });
    startTurnTimer(io, roomCode);
  }
  
}

// ===================== AUTO MOVE HELPER =====================
function autoMoveIfSinglePawn(io, roomId, room, currentUser, diceValue) {
  const positions = room.positions[currentUser.color];

  const pawnsOnBoard = positions.filter(p => p > 0 && p !== 999);
  const homePawns = positions.filter(p => p === 0);

  // ==== Case 1: Agar home me pawn hai aur dice 6 hai -> Choice dena, auto move mat karo
  if (homePawns.length > 0 && diceValue === 6) {
    return false; // user khud decide karega
  }

  // ==== Case 2: Agar sirf ek pawn board pe hai (aur dice koi bhi ho) aur nikalne ke liye home me kuch nahi bacha
  if (pawnsOnBoard.length === 1 && (diceValue !== 6 || homePawns.length === 0)) {
    const pawnIndex = positions.findIndex(p => p > 0 && p !== 999);
    const result = ruleEngine.movePiece(room, currentUser.color, pawnIndex, diceValue);

    room.hasRolledDice[currentUser.id] = false;
    room.lastDiceValue = 0;

    if (!result.error) {
      room.positions = result.positions;
      io.to(roomId).emit("position_update", room.positions);

      if (result.won) {
        room.isGameOver = true;
        io.to(roomId).emit("game_over", { winner: currentUser, positions: room.positions });

        setTimeout(() => {
          // सभी socket को उस room से disconnect कर दो
          const clients = io.sockets.adapter.rooms.get(roomId);
          if (clients) {
            for (const clientId of clients) {
              const clientSocket = io.sockets.sockets.get(clientId);
              if (clientSocket) clientSocket.leave(roomId);
            }
          }
          // room delete करो
          delete activeRooms[roomId];
          delete roomColorMap[roomId];
          console.log(`🗑 Room ${roomId} destroyed after game over`);
        }, 5000); // 5 सेकंड delay ताकि client को final events मिल जाएं
        
        return true;
      }

      if (!result.extraTurnRequired) {
        room.currentTurnIndex = result.nextTurnIndex;
        io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
        startTurnTimer(io, roomId);
      } else {
        startTurnTimer (io, roomId);
      }
      
      return true;
    } else {
      room.currentTurnIndex = result.nextTurnIndex;
      io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
      return true;
    }
  }

  return false;
}

