import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGameContext, GameProvider } from "../../ludo/context/GameContext";
import Board from "../../ludo/components/Board";
import DicePanel from "../../ludo/components/DicePanel";
import TopBar from "../user/layout/TopBar";
import socket from "../../utils/socket";

const corners = [
  { pos: "top-left", token: "red" },
  { pos: "top-right", token: "green" },
  { pos: "bottom-left", token: "blue" },
  { pos: "bottom-right", token: "yellow" },
];

const dicePanelPositions = {
  "top-left": "absolute top-25 left-4 md:top-20 md:left-70",
  "top-right": "absolute top-25 right-4 md:top-20 md:right-70",
  "bottom-left": "absolute bottom-25 left-4 md:bottom-20 md:left-70",
  "bottom-right": "absolute bottom-25 right-4 md:bottom-20 md:right-70",
};

const PlayContent = () => {
  const {
    roomId,
    setRoomId,
    users,
    setUsers,
    setMyUserId,
    currentTurnId,
    setCurrentTurnId,
  } = useGameContext();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramRoomId = searchParams.get("roomId");

  useEffect(() => {
    if (paramRoomId) {
      setRoomId(paramRoomId);
      socket.emit("get_room_info", { roomId: paramRoomId });
    }

    socket.on("room_info", ({ players, you }) => {
      setUsers(players);
      setMyUserId(you?.id);
    });

    socket.on("turn_changed", ({ playerId }) => {
      setCurrentTurnId(playerId);
    });

    socket.on("disconnect", () => {
      navigate("/");
    });

    return () => {
      socket.off("room_info");
      socket.off("turn_changed");
      socket.off("disconnect");
    };
  }, [paramRoomId, navigate, setRoomId, setUsers, setMyUserId, setCurrentTurnId]);

  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-screen bg-white">
      <div className="fixed top-0 w-full z-10">
        <TopBar />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Board />
        {corners.map(({ pos, token }) => {
          const player = users.find((u) => u.color === token);
          if (!player) return null;
          return (
            <div key={token} className={dicePanelPositions[pos]}>
              <DicePanel user={player} isCurrentTurn={currentTurnId === player.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Play() {
  return (
    <GameProvider>
      <PlayContent />
    </GameProvider>
  );
}
