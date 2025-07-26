import React, { useState, useEffect } from "react";
import { useGameContext } from "../context/GameContext";
import socket from "../../utils/socket";
import rollSound from "../assests/roll.mp3";
import "../styles/Dice.css";

const faceRotation = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: 180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
};

const Dice = ({ isCurrentTurn, userId }) => {
  const { roomId, myUserId, diceValues } = useGameContext();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [rolling, setRolling] = useState(false);
  const audio = new Audio(rollSound);

  const handleRoll = () => {
    if (!isCurrentTurn || myUserId !== userId) return;
    socket.emit("roll_dice", { roomId, playerId: userId });
  };

  // apne user ke dice value change hone par hi animate karo
  useEffect(() => {
    const diceData = diceValues[userId];
    if (!diceData) return;

    const { value, rollId } = diceData;
    const base = faceRotation[value];
    const randX = base.x + 360 * (3 + Math.floor(Math.random() * 2));
    const randY = base.y + 360 * (3 + Math.floor(Math.random() * 2));

    setRotation({ x: randX, y: randY });
    setRolling(true);
    audio.play();

    const t = setTimeout(() => {
      setRolling(false);
      audio.pause();
      audio.currentTime = 0;
    }, 600);
    return () => clearTimeout(t);
  }, [diceValues[userId]?.rollId]);

  const value = diceValues[userId]?.value || 1;

  return (
    <div className="dice-container" onClick={handleRoll}>
      <div
        className={`dice3d ${rolling ? "rolling" : ""}`}
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        {/* Dice faces same rahengi */}
        <div className="face face1"><span className="dot center" /></div>
        <div className="face face2"><span className="dot top-left" /><span className="dot bottom-right" /></div>
        <div className="face face3"><span className="dot top-left" /><span className="dot center" /><span className="dot bottom-right" /></div>
        <div className="face face4"><span className="dot top-left" /><span className="dot top-right" /><span className="dot bottom-left" /><span className="dot bottom-right" /></div>
        <div className="face face5"><span className="dot top-left" /><span className="dot top-right" /><span className="dot center" /><span className="dot bottom-left" /><span className="dot bottom-right" /></div>
        <div className="face face6"><span className="dot top-left" /><span className="dot mid-left" /><span className="dot bottom-left" /><span className="dot top-right" /><span className="dot mid-right" /><span className="dot bottom-right" /></div>
      </div>
    </div>
  );
};

export default Dice;
