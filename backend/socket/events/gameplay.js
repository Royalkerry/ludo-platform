const ruleEngine = require("../../rules/ruleEngine");
const { activeRooms } = require("../state");
const { startTurnTimer } = require("../helpers/timers");
const { autoMoveIfSinglePawn } = require("../helpers/autoMove"); // We'll create this small helper.

module.exports = (io, socket) => {
  socket.on("roll_dice", ({ roomId, userId }) => {
    const room = activeRooms[roomId];
    if (!room || room.isGameOver) return;

    const currentUser = room.users[room.currentTurnIndex];
    if (currentUser.id !== userId) {
      io.to(socket.id).emit("dice_error", { message: "Not your turn!" });
      return;
    }
    if (room.hasRolledDice[currentUser.id]) {
      io.to(socket.id).emit("dice_error", { message: "You have already rolled the dice!" });
      return;
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;
    if (!room.sixCount) room.sixCount = {};
    if (!room.sixCount[userId]) room.sixCount[userId] = 0;
    room.sixCount[userId] = diceValue === 6 ? room.sixCount[userId] + 1 : 0;

    room.lastDiceValue = diceValue;
    room.hasRolledDice[currentUser.id] = true;

    io.to(roomId).emit("dice_rolled", { userId, value: diceValue, rollId: Date.now() });

    // Auto move logic
    const moved = autoMoveIfSinglePawn(io, roomId, room, currentUser, diceValue);
    if (moved) {
      startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
      return;
    }

    const userPositions = room.positions[currentUser.color];
    const allHome = userPositions.every((pos) => pos === 0);

    if (room.sixCount[userId] >= 3) {
      room.sixCount[userId] = 0;
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
      room.hasRolledDice[currentUser.id] = false;
      room.lastDiceValue = 0;
      io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
      startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
      return;
    }

    if (allHome && diceValue !== 6) {
      room.hasRolledDice[currentUser.id] = false;
      room.lastDiceValue = 0;
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
      io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
      startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
    }
  });
  // mid game ranking update 
  socket.on("get_rankings", ({ roomId }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    io.to(socket.id).emit("ranking_update", { rankings: room.rankings });
  });

  socket.on("piece_moved", ({ roomId, color, pawnIndex }) => {
    const room = activeRooms[roomId];
    if (!room || room.isGameOver) return;

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

    if (!result.error) {
      room.hasRolledDice[currentUser.id] = false;
      room.lastDiceValue = 0;
      room.positions = result.positions;
      
      io.to(roomId).emit("position_update", room.positions);

      // --- NEW RANKING LOGIC ---
    const pawns = room.positions[color];
    const allHome = pawns.every((p) => p === 999); // home = 999
    if (allHome && !room.rankings.find((r) => r.userId === currentUser.id)) {
      const rank = room.rankings.length + 1;
      room.rankings.push({ userId: currentUser.id, rank });

      // Notify all players about new ranking
      io.to(roomId).emit("ranking_update", { rankings: room.rankings });

      // If only one player left → mark them last & end game
      if (room.rankings.length === room.users.length - 1) {
        const remaining = room.users.find(
          (u) => !room.rankings.some((r) => r.userId === u.id)
        );
        if (remaining) {
          room.rankings.push({ userId: remaining.id, rank: room.users.length });
          io.to(roomId).emit("ranking_update", { rankings: room.rankings });
          room.isGameOver = true;
          io.to(roomId).emit("game_over", {
            rankings: room.rankings,
            positions: room.positions,
          });
          return;
        }
      }

      // If all players are ranked → end game
      if (room.rankings.length === room.users.length) {
        room.isGameOver = true;
        io.to(roomId).emit("game_over", {
          rankings: room.rankings,
          positions: room.positions,
        });
        return;
      }
    }
    // --- END RANKING LOGIC ---


      if (result.won) {
        room.isGameOver = true;
        io.to(roomId).emit("game_over", { winner: currentUser, positions: room.positions });
        return;
      }

      if (!result.extraTurnRequired) {
        room.currentTurnIndex = result.nextTurnIndex;
        io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
        startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
      } else {
        startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
      }
    } else {
      io.to(socket.id).emit("move_error", { message: result.error });
      if (result.forceNextTurn) {
        room.currentTurnIndex = result.nextTurnIndex;
        io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
        startTurnTimer(io, roomId, activeRooms, require("../helpers/timers").handleSkip);
      }
    }
  });
  
  
};
