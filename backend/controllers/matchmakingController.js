const { GameRoom, GamePlayer } = require("../models");

async function autoMatchPlayer(userId, playerCount = 2) {
  let room = await GameRoom.findOne({
    where: { status: "waiting", playerCount },
    include: [{ model: GamePlayer }],
  });

  if (!room || !room.GamePlayers || room.GamePlayers.length >= playerCount) {
    // No suitable room found → create new
    room = await GameRoom.create({ roomCode: `ROOM-${Date.now()}`, playerCount });
    await GamePlayer.create({ roomId: room.id, userId });

    // Fallback to AI after 5 seconds if still alone
    setTimeout(async () => {
      const updatedRoom = await GameRoom.findByPk(room.id, {
        include: [{ model: GamePlayer }],
      });
      if (updatedRoom.GamePlayers.length < playerCount) {
        const missing = playerCount - updatedRoom.GamePlayers.length;
        for (let i = 0; i < missing; i++) {
          await GamePlayer.create({ roomId: updatedRoom.id, isAI: true });
        }
        await updatedRoom.update({ status: "started" });
      }
    }, 5000);

    return room;
  }

  // Room found → join it
  await GamePlayer.create({ roomId: room.id, userId });

  const totalPlayers = room.GamePlayers.length + 1;
  if (totalPlayers === playerCount) {
    await room.update({ status: "started" });
  }
  return room;
}

module.exports = { autoMatchPlayer };
