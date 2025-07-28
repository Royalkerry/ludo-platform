const { GameRoom, GameUser } = require("../models");

async function autoMatchUser(userId, userCount = 2) {
  let room = await GameRoom.findOne({
    where: { status: "waiting", userCount },
    include: [{ model: GameUser }],
  });

  if (!room || !room.GameUser || room.GameUser.length >= userCount) {
    // No suitable room found → create new
    room = await GameRoom.create({ roomCode: `ROOM-${Date.now()}`, userCount });
    await GameUser.create({ roomId: room.id, userId });

    // Fallback to AI after 5 seconds if still alone
    setTimeout(async () => {
      const updatedRoom = await GameRoom.findByPk(room.id, {
        include: [{ model: GameUser }],
      });
      if (updatedRoom.GameUser.length < userCount) {
        const missing = userCount - updatedRoom.GameUser.length;
        for (let i = 0; i < missing; i++) {
          await GameUser.create({ roomId: updatedRoom.id, isAI: true });
        }
        await updatedRoom.update({ status: "started" });
      }
    }, 5000);

    return room;
  }

  // Room found → join it
  await GameUser.create({ roomId: room.id, userId });

  const totalUsers = room.GameUser.length + 1;
  if (totalUsers === userCount) {
    await room.update({ status: "started" });
  }
  return room;
}

module.exports = { autoMatchUser };
