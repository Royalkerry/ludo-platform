import React, { useEffect, useRef } from "react";
import Dice from "./Dice";
import { useGameContext } from "../context/GameContext";

const DicePanel = ({ user }) => {
  const { currentTurnId, diceValues, turnTimer, skipCounts } = useGameContext();
  const isCurrentTurn = currentTurnId === user.id;
  const diceValue = diceValues[user.id] || 0;

  const audioRef = useRef(null);
  const skipCount = skipCounts[user.id] || 0;

  useEffect(() => {
    if (isCurrentTurn && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [isCurrentTurn]);

  const safeTimer = typeof turnTimer === "number" ? turnTimer : 0;
  const progress = isCurrentTurn ? Math.max(0, Math.min(1, safeTimer / 30)) : 1;

  return (
    <div
      className={`relative w-36 h-24 rounded-xl shadow-md border px-3 py-2 flex justify-between items-center text-black
        ${isCurrentTurn ? "ring-2 ring-yellow-400 animate-pulse bg-amber-50" : "bg-white"}`}
    >
      <audio ref={audioRef} src="/turn-alert.mp3" preload="auto" />

      {/* === user Color Dot (Top Left) === */}
      <span
        className="absolute top-1 left-2 w-3 h-3 rounded-full shadow"
        style={{ backgroundColor: user.color || "gray" }}
      ></span>

      {/* === Skip Dots (Top Right) === */}
      <div className="absolute -top-1 right-3 flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`text-lg ${
              i <= skipCount ? "text-red-500 animate-pulse" : "text-gray-300 animate-pulse"
            }`}
          >
            ●
          </span>
        ))}
      </div>

      {/* === Left: Avatar + Name + Timer Bar === */}
      <div className="flex flex-col items-center gap-1 w-16">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full border"
        />
      
        <p className="text-xs font-semibold text-center">{user.name}</p>
      </div>

      {/* === Right: Dice Box === */}
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-md shadow-inner 
        ${isCurrentTurn ? "bg-yellow-100 border border-yellow-400" : "bg-gray-100"}`}
      >
        <Dice userId={user.id} isCurrentTurn={isCurrentTurn} value={diceValue} />
      </div>


      {/* === Bottom Timer Bar === */}
      <div className="absolute bottom-2 left-0 w-full h-2 bg-gray-200 rounded-b-xl overflow-hidden">
  <div
    className={`h-full transition-all duration-500 ${
      safeTimer <= 5 && isCurrentTurn ? "bg-red-500" : "bg-yellow-400"
    }`}
    style={{ width: `${progress * 100}%` }}
  ></div>
</div>
    </div>
  );
};

export default DicePanel;
