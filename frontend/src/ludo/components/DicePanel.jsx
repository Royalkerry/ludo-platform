import React from "react";
import Dice from "./Dice"; 
import { useGameContext } from "../context/GameContext";

const DicePanel = ({ user }) => {
  const { currentTurnId, diceValues} = useGameContext();
  const isCurrentTurn = currentTurnId === user.id;
  console.log(`Panel User: ${user.id} CurrentTurn: ${currentTurnId}`);

  const diceValue = diceValues[user.id] || 0; 

  return (
    <div className="bg-amber-400 shadow-lg rounded-xl p-4 w-28 text-center border-2 border-gray-300 relative">
      {/* Color Dot */}
      <span
        className="absolute top-2 right-2 w-3 h-3 rounded-full"
        style={{ backgroundColor: user.color || "gray" }}
      ></span>

      <img
        src={user.avatar || "/default-avatar.png"}
        alt={user.name}
        className="w-12 h-12 rounded-full mx-auto border"
      />
      <p className="text-sm font-semibold mt-2">{user.name}</p>

      <div className="mt-2">
        {/* {isCurrentTurn ? <Dice value={diceValue}/> : <span className="text-xl">⏳</span>} */}
        <Dice userId={user.id} isCurrentTurn={isCurrentTurn} value={diceValue} />
      </div>
    </div>
  );
};

export default DicePanel;
