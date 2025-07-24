// src/ludo/context/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../../utils/socket";

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [diceValues, setDiceValues] = useState(0);
  const [users, setUsers] = useState([]); // array of { id, name, avatar, color, points }
  const [playerPositions, setPlayerPositions] = useState({
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  });
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  // ==== Socket Listeners ====
  useEffect(() => {
    socket.on("your_id", (userId) => {
      setMyUserId(userId);
    });

    socket.on("room_info", ({ roomId, players, you }) => {
      if (roomId) setRoomId(roomId);
      setUsers(players);
      setMyUserId(you?.id);
    });

    socket.on("position_update", (positions) => {
      setPlayerPositions(positions);
    });

    socket.on("turn_update", ({ playerId }) => {
      console.log("Turn update:", playerId);
      setCurrentTurnId(playerId);
    });

    socket.on("turn_changed", ({ playerId }) => {
      console.log("Turn changed (match start):", playerId);
      setCurrentTurnId(playerId);
    });

    socket.on("dice_rolled", ({ playerId, value }) => {
      console.log(`Dice rolled by ${playerId}: ${value}`);
      setDiceValues((prev) => ({...prev, [playerId]: value}));
    });

    // ==== Matchmaking events ====
    socket.on("color_selection_start", ({ roomId, availableColors, players }) => {
      console.log("Color selection phase started:", players);
      setRoomId(roomId);
      setUsers(players);
      // TODO: handle color selection UI using availableColors
    });

    socket.on("color_update", ({ userId, color }) => {
      console.log(`Color chosen: ${userId} -> ${color}`);
      setUsers((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, color } : p))
      );
    });

    socket.on("match_found", ({ roomId, players }) => {
      console.log("Match found:", roomId, players);
      setRoomId(roomId);
      setUsers(players);
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
      
    };
  }, []);

  // ==== API methods for components ====
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

  // Jab roomId change hota hai tab server se fresh info lo
  useEffect(() => {
    if (roomId) {
      socket.emit("get_room_info", { roomId });
    }
  }, [roomId]);

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
        
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
