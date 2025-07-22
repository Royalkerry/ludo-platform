// src/pages/play/GameScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../../ludo/context/GameContext";
import Board from "../../ludo/components/Board";
import DicePanel from "../../ludo/components/DicePanel";
import TopBar from "../user/layout/TopBar";
import socket from "../../utils/socket";

const GameScreen = () => {
  const {
    setRoomId,
    setUsers,
    setMyUserId,
    users,
    currentTurnId,
    setCurrentTurnId,
  } = useGameContext();

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room_info", ({ roomId, users, you }) => {
      setRoomId(roomId);
      setUsers(users);
      setMyUserId(you.id);
    });

    socket.on("turn_changed", ({ userId }) => {
      setCurrentTurnId(userId);
    });

    socket.on("disconnect", () => {
      navigate("/");
    });

    return () => {
      socket.off("room_info");
      socket.off("turn_changed");
      socket.off("disconnect");
    };
  }, []);

  const positions2p = ["top-0 left-0", "bottom-0 right-0"];
  const positions4p = ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"];
  const positions = users.length === 2 ? positions2p : positions4p;

  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-screen bg-white">
      <div className="fixed top-0 w-full z-10">
        <TopBar />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {users.map((user, i) => (
          <DicePanel key={user.id} user={user} position={positions[i]} />
        ))}
        <Board />
      </div>
    </div>
  );
};

export default GameScreen;
