import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
import { useGameContext } from "../context/GameContext";
import rollSound from "../assests/roll.mp3";
import "../styles/Dice.css";

const Dice = ({ isCurrentTurn, userId, value }) => {
  const { roomId, myUserId } = useGameContext();
  const [rolling, setRolling] = useState(false);

  const audio = new Audio(rollSound);

  const handleRoll = () => {
    if (!isCurrentTurn || myUserId !== userId) return;
    audio.play();
    setRolling(true);
    socket.emit("roll_dice", { roomId, playerId: userId });
  };

  useEffect(() => {
    if (rolling) {
      const t = setTimeout(() => {
        setRolling(false);
        audio.pause();
        audio.currentTime = 0;
      }, 1000); // 1 second animation
      return () => clearTimeout(t);
    }
  }, [rolling]);

  return (
    <div id="dice" onClick={handleRoll}>
      <div className={`dice ${rolling ? "rotate" : ""}`}>
        <div className={`inner-face face${value || 0}`}>
          {value === 0 ? (
            <span className="dice-initial-face">
              {isCurrentTurn ? "ROLL" : "⏳"}
            </span>
          ) : (
            Array.from({ length: value }).map((_, i) => (
              <span key={i} className="dot" />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dice;
// 2d mai working code , 