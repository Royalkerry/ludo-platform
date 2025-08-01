/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../../utils/socket";

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [diceValues, setDiceValues] = useState({});
  const [dice, setDice] = useState({ value: 1, rollId: 0 });
  const [diceDisabled, setDiceDisabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [turnTimer, setTurnTimer] = useState(30);
  const [skipCounts, setSkipCounts] = useState({});
  const [rankings, setRankings] = useState([]);
  const [userPositions, setUserPositions] = useState({
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  });
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  const movePawn = (color, pawnIndex, steps) => {
    if (roomId && myUserId) {
      socket.emit("piece_moved", { roomId, color, pawnIndex, steps });
    }
  };

  useEffect(() => {
    socket.on("your_id", (userId) => setMyUserId(userId));

    socket.on("room_info", ({ roomId, users, you }) => {
      if (roomId) setRoomId(roomId);
      setUsers(users);
      setMyUserId(you?.id);
      socket.emit("get_positions", { roomId });
    });

    socket.on("position_update", (positions) => setUserPositions(positions));
    socket.on("turn_update", ({ userId }) => setCurrentTurnId(userId));
    socket.on("turn_changed", ({ userId }) => setCurrentTurnId(userId));

    socket.on("dice_rolled", ({ userId, value, rollId }) => {
      setDiceValues((prev) => ({ ...prev, [userId]: { value, rollId } }));
    });

    socket.on("color_selection_start", ({ roomId, users }) => {
      setRoomId(roomId);
      setUsers(users);
    });

    socket.on("color_update", ({ userId, color }) => {
      setUsers((prev) => prev.map((p) => (p.id === userId ? { ...p, color } : p)));
    });

    socket.on("match_found", ({ roomId, users }) => {
      setRoomId(roomId);
      setUsers(users);
    });

    socket.on("game_over", ({ winner, positions }) => {
      setWinner(winner);
      setUserPositions(positions);
    });

    socket.on("turn_timer", ({ userId, remaining }) => {
      setCurrentTurnId(userId);
      setTurnTimer(remaining);
    });

    socket.on("user_skipped", ({ userId, skipCount }) => {
      setSkipCounts((prev) => ({ ...prev, [userId]: skipCount }));
    });

    socket.on("ranking_update", (data) => {
      setRankings(data.rankings);
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
      socket.off("turn_timer");
      socket.off("user_skipped");
      socket.off("ranking_update");
    };
  }, []);

  useEffect(() => {
    setDiceDisabled(currentTurnId !== myUserId);
  }, [currentTurnId, myUserId]);

  const selectColor = (color) => {
    if (roomId && myUserId) {
      socket.emit("select_color", { roomId, userId: myUserId, color });
    }
  };

  const rollDice = () => {
    if (roomId && myUserId) {
      socket.emit("roll_dice", { roomId, userId: myUserId });
    }
  };

  useEffect(() => {
    if (roomId) {
      socket.emit("get_room_info", { roomId });
    }
  }, [roomId]);

  const currentUser = users.find((u) => u.id === currentTurnId);
  const currentColor = currentUser?.color || null;

  // new changes for user choice for rejoin

  const checkActiveRoom = (userId, callback) => {
    socket.emit("check_active_room", { userId });

    socket.once("active_room_found", (data) => {
      callback({ found: true, data });
    });

    socket.once("no_active_room", () => {
      callback({ found: false });
    });
  };

  return (
    <GameContext.Provider
      value={{
        roomId,
        setRoomId,
        users,
        setUsers,
        userPositions,
        setUserPositions,
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
        turnTimer,
        setTurnTimer,
        skipCounts,
        setSkipCounts,
        checkActiveRoom,
        rankings,
        setRankings,
      }}
    >
      {children}
        </GameContext.Provider>
  );
};
