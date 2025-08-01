const db = require("../../models");
const { AVAILABLE_COLORS, roomColorMap, activeRooms } = require("../state");
const { startTurnTimer } = require("./timers");

async function createRoom(io, key, usersCount, waitingUsers) {
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
  const dbRoom = await db.GameRoom.create({
    roomCode,
    status: "started",
    gameType: "standard",
    userCount: usersCount
  });

  for (const u of uniqueUsers) {
    await db.GameUser.create({ roomId: dbRoom.id, userId: u.userId, isAI: false });
  }

  roomColorMap[roomCode] = {};
  uniqueUsers.forEach((p) => {
    const userSocket = io.sockets.sockets.get(p.socketId);
    if (userSocket) userSocket.join(roomCode);
    io.to(p.socketId).emit("color_selection_start", {
      roomId: roomCode,
      availableColors: AVAILABLE_COLORS,
      users: uniqueUsers.map((mp) => ({
        id: mp.userId,
        name: mp.name,
        avatar: mp.avatar,
        points: mp.points
      }))
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
      color: null
    })),
    currentTurnIndex: 0,
    positions: { red: [0, 0, 0, 0], green: [0, 0, 0, 0], yellow: [0, 0, 0, 0], blue: [0, 0, 0, 0] },
    lastDiceValue: 0,
    hasRolledDice: {},
    skipCount: {},
    turnTimer: null,
    turnRemaining: 30,
    ranking: []
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
      io.to(roomCode).emit("color_update", {
        userId: p.id,
        color: chosen,
        roomId: roomCode,
        takenColors: Object.keys(colorMap)
      });
    }
  });

  if (activeRooms[roomCode].users.every((p) => p.color)) {
    const room = activeRooms[roomCode];
    const colorOrder = ["red", "yellow", "green", "blue"];
    room.users.sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color));

    room.users.forEach((p) =>
      io.to(p.socketId).emit("match_found", {
        roomId: roomCode,
        users: room.users.map((mp) => ({
          id: mp.id,
          name: mp.name,
          avatar: mp.avatar,
          points: mp.points,
          color: mp.color
        }))
      })
    );

    room.currentTurnIndex = 0;
    io.to(roomCode).emit("turn_changed", { userId: room.users[0].id });
    startTurnTimer(io, roomCode, activeRooms, require("./timers").handleSkip);
  }
}

module.exports = { createRoom, autoAssignColors };
