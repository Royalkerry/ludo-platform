const waitingUsers = {};   // { "2_100": [Users], ... }
const activeRooms = {};
const roomColorMap = {};   // { roomCode: { red: userId, blue: userId, ... } }
const AVAILABLE_COLORS = ["red", "green", "yellow", "blue"];

module.exports = {
  waitingUsers,
  activeRooms,
  roomColorMap,
  AVAILABLE_COLORS
};
