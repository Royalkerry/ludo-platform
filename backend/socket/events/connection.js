const matchEvents = require("./match");
const gameplayEvents = require("./gameplay");
const roomInfoEvents = require("./roomInfo");
const disconnectEvent = require("./disconnect");
const handleRejoin = require("../rejoin");

module.exports = (io, socket) => {
  console.log("✅ Socket connected:", socket.id);

  // rejoin events
  handleRejoin(io, socket, require("../state").activeRooms, require("../state").roomColorMap);

  // attach modular events
  matchEvents(io, socket);
  gameplayEvents(io, socket);
  roomInfoEvents(io, socket);
  disconnectEvent(io, socket);
};
