const ruleEngine = require("../../rules/ruleEngine");

function autoMoveIfSinglePawn(io, roomId, room, currentUser, diceValue) {
  const positions = room.positions[currentUser.color];
  const pawnsOnBoard = positions.filter((p) => p > 0 && p !== 999);
  const homePawns = positions.filter((p) => p === 0);

  if (homePawns.length > 0 && diceValue === 6) return false;

  if (pawnsOnBoard.length === 1 && (diceValue !== 6 || homePawns.length === 0)) {
    const pawnIndex = positions.findIndex((p) => p > 0 && p !== 999);
    const result = ruleEngine.movePiece(room, currentUser.color, pawnIndex, diceValue);
    room.hasRolledDice[currentUser.id] = false;
    room.lastDiceValue = 0;

    if (!result.error) {
      room.positions = result.positions;
      io.to(roomId).emit("position_update", room.positions);
      if (result.won) {
        room.isGameOver = true;
        io.to(roomId).emit("game_over", { winner: currentUser, positions: room.positions });
        return true;
      }
      if (!result.extraTurnRequired) {
        room.currentTurnIndex = result.nextTurnIndex;
        io.to(roomId).emit("turn_changed", { userId: room.users[room.currentTurnIndex].id });
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
module.exports = { autoMoveIfSinglePawn };
