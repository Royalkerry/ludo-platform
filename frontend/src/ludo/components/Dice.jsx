// components/Dice.jsx
import React, { useState } from "react";
import socket from "../../utils/socket";
import { useGameContext } from "../context/GameContext";

export default function Dice() {
  const { myUserId } = useGameContext();
  const [rolling, setRolling] = useState(false);

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;

    socket.emit("roll_dice", { userId: myUserId, value });
    setTimeout(() => setRolling(false), 1000);
  };

  return (
    <button
      onClick={rollDice}
      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 text-sm"
    >
      🎲 Roll
    </button>
  );
}
