import React from "react";
import Dice from "./Dice"; 
import { useGameContext } from "../context/GameContext";

const DicePanel = ({ user }) => {
  const { currentTurnId, diceValues } = useGameContext();
  const isCurrentTurn = currentTurnId === user.id;
  const diceValue = diceValues[user.id] || 0; 

  return (
    <div
  className={`text-black shadow-lg rounded-xl p-3 w-38 flex items-center gap-3 border-2 relative
    ${isCurrentTurn ? "ring-4 ring-yellow-500 animate-pulse" : "border-gray-300 bg-amber-200"}`}
>

    {/* Player Color Dot (Top Right) */}
    <span
      className="absolute top-2 left-2 w-3 h-3 rounded-full"
      style={{ backgroundColor: user.color || "gray" }}
    ></span>

    {/* Avatar + Name vertical */}
    <div className="flex flex-col items-center w-16">
      <img
        src={user.avatar || "/default-avatar.png"}
        alt={user.name}
        className="w-12 h-12 rounded-full border"
      />
      <p className="text-xs font-semibold mt-1 text-center">{user.name}</p>
    </div>

    {/* Dice on Right */}
    <div className="flex-1 flex items-center justify-center">
      <Dice
        userId={user.id}
        isCurrentTurn={isCurrentTurn}
        value={diceValue}
      />
    </div>
  </div>
  );
};

export default DicePanel;
