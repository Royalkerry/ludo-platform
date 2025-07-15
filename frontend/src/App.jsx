// src/App.jsx
import React from "react";
import Board3D from "./components/Board3D";
import Dice from "./components/Dice";
import useGameStore from "./store/gameStore";
import socket from "./socket";

export default function App() {
  const updatePawnPosition = useGameStore((s) => s.updatePawnPosition);
  const resetGame = useGameStore((s) => s.resetGame);

  React.useEffect(() => {
    socket.on("pawnMoved", ({ id, index }) => {
      updatePawnPosition(id, index);
    });

    socket.on("gameEnded", ({ roomId, winnerId }) => {
      alert(`🏆 Game over! Winner: ${winnerId}`);
      resetGame();
    });

    return () => {
      socket.off("pawnMoved");
      socket.off("gameEnded");
    };
  }, [updatePawnPosition, resetGame]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Board3D />
      <Dice />
    </div>
  );
}
