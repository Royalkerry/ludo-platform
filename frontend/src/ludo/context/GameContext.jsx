// src/ludo/context/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../../utils/socket";

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [diceValues, setDiceValues] = useState({});
  const [dice, setDice] = useState({value:1, rollId:0});
  const [diceDisabled, setDiceDisabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [playerPositions, setPlayerPositions] = useState({
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  });
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  const startingCells = {
    red: 1,
    yellow: 14,
    green: 27,
    blue: 40,
  };

  const homeEntry = {
    red: 52,
    yellow: 13,
    green: 26,
    blue: 39,
  };

  const homeTracks = {
    red: [101, 102, 103, 104, 105],
    yellow: [201, 202, 203, 204, 205],
    green: [301, 302, 303, 304, 305],
    blue: [401, 402, 403, 404, 405],
  };

  // ===== Pawn Move Logic =====
  const movePawn = (color, pawnIndex, steps) => {
    if (roomId && myUserId) {
      socket.emit("piece_moved", { roomId, color, pawnIndex, steps });
    }
  };

  // ==== Socket Listeners ====
  useEffect(() => {
    socket.on("your_id", (userId) => setMyUserId(userId));

    socket.on("room_info", ({ roomId, players, you }) => {
      if (roomId) setRoomId(roomId);
      setUsers(players);
      setMyUserId(you?.id);
    });

    socket.on("position_update", (positions) => setPlayerPositions(positions));

    socket.on("turn_update", ({ playerId }) => setCurrentTurnId(playerId));
    socket.on("turn_changed", ({ playerId }) => setCurrentTurnId(playerId));

    socket.on("dice_rolled", ({ playerId, value, rollId }) => {
      setDiceValues((prev) => ({ ...prev, [playerId]: {value, rollId} }));
    });

    socket.on("color_selection_start", ({ roomId, availableColors, players }) => {
      setRoomId(roomId);
      setUsers(players);
    });

    socket.on("color_update", ({ userId, color }) => {
      setUsers((prev) => prev.map((p) => (p.id === userId ? { ...p, color } : p)));
    });

    socket.on("match_found", ({ roomId, players }) => {
      setRoomId(roomId);
      setUsers(players);
    });
    socket.on("game_over", ({ winner, positions }) => {
      setWinner(winner);
      setPlayerPositions(positions);
    });


    return () => {
      socket.off("your_id");
      socket.off("room_info");
      socket.off("position_update");
      socket.off("turn_update");
      socket.off("turn_changed");
      socket.off("dice_rolled");
      socket.off("color_selection_start");
      socket.off("color_update");
      socket.off("match_found");
      socket.off("game_over");
    };
  }, []);

  const selectColor = (color) => {
    if (roomId && myUserId) {
      socket.emit("select_color", { roomId, userId: myUserId, color });
    }
  };

  const rollDice = () => {
    if (roomId && myUserId) {
      socket.emit("roll_dice", { roomId, playerId: myUserId });
    }
  };

  useEffect(() => {
    if (roomId) {
      socket.emit("get_room_info", { roomId });
    }
  }, [roomId]);

  const currentPlayer = users.find((u) => u.id === currentTurnId);
  const currentColor = currentPlayer?.color || null;

  return (
    <GameContext.Provider
      value={{
        roomId,
        setRoomId,
        users,
        setUsers,
        playerPositions,
        setPlayerPositions,
        currentTurnId,
        setCurrentTurnId,
        myUserId,
        setMyUserId,
        diceValues,
        setDiceValues,
        selectColor,
        rollDice,
        diceDisabled,
        setDiceDisabled,
        movePawn,
        dice,
        setDice,
        winner,
        setWinner,
        currentColor,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
// nahi chala to undu kr do ye msg read hone tak 