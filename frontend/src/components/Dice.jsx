import React from "react";
import useGameStore from "../store/gameStore";
import socket from "../socket";

export default function Dice() {
  const { currentPlayer, diceValue } = useGameStore();
  const roomId = localStorage.getItem("roomId");

  const roll = () => {
    socket.emit("rollDice", { roomId });
  };

  return (
    <div style={{ position: "absolute", top: 20, right: 20 }}>
      <h3>🎯 {currentPlayer.toUpperCase()}'s Turn</h3>
      <button onClick={roll}>Roll Dice</button>
      {diceValue && <p>Dice: {diceValue}</p>}
    </div>
  );
}
