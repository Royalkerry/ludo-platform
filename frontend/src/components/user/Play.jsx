import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGameContext, GameProvider } from "../../ludo/context/GameContext";
import Board from "../../ludo/components/Board";
import DicePanel from "../../ludo/components/DicePanel";
import socket from "../../utils/socket";

const corners = [
  { pos: "top-left", token: "yellow" },
  { pos: "top-right", token: "green" },
  { pos: "bottom-left", token: "red" },
  { pos: "bottom-right", token: "blue" },
];

const dicePanelPositions = {
  "top-left": "absolute top-20 left-0 md:top-20 md:left-20",
  "top-right": "absolute top-20 right-0 md:top-20 md:right-20",
  "bottom-left": "absolute bottom-20 left-0 md:bottom-20 md:left-20",
  "bottom-right": "absolute bottom-20 right-0 md:bottom-20 md:right-20",
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
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <Board />
        {corners.map(({ pos, token }) => {
          const player = users.find((u) => u.color === token);
          if (!player) return null;
          return (
            <div key={token} className={dicePanelPositions[pos]}>
              <DicePanel
                user={player}
                isCurrentTurn={currentTurnId === player.id}
              />
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
