import React, { useState, useEffect, Children } from "react";
import Piece from "./Piece";
import Home from "./Home";
import Square from "./Square";
import trackLayout from "../utilities/TrackLayout";
import { useGameContext } from "../context/GameContext";
import "../styles/Board.css";

const Board = () => {
  const { userPositions, users, currentTurnId, winner} = useGameContext();
  const [layout, setLayout] = useState(trackLayout);
  const HOME_ORDER = ["yellow", "green", "red", "blue"];

  // Current user color
  const currentUser = users.find((u) => u.id === currentTurnId);
  const currentColor = currentUser?.color;

  useEffect(() => {
    const updatedLayout = { ...trackLayout };
    Object.values(updatedLayout).forEach((cell) => (cell.Piece = []));
    Object.entries(userPositions).forEach(([color, positions = []]) => {
      positions.forEach((pos, index) => {
        if (pos === 999) {
          updatedLayout["ww"]?.Piece.push(`${color}-${index}`);
        } else if (pos !== 0) {
          updatedLayout[pos]?.Piece.push(`${color}-${index}`);
        }
      });
    });
    setLayout(updatedLayout);
  }, [userPositions]);
  
  return (
    <div id="board" className="relative mx-auto">
      {/* Homes with glow for current turn */}
      {HOME_ORDER.map((color) => (
        <Home
          key={color}
          color={color}
          className={color === currentColor ? "glow-home" : ""}
        >
          {userPositions[color]?.map((position, index) =>
            position === 0 ? (
              <Piece key={index} id={`${color}-${index}`} color={color} />
            ) : null
          )}
        </Home>
      ))}

      <Square />

      {/* Board track pieces */}
      {Object.entries(layout).map(([cellId, cell]) => {
        const className = cell.Piece.length > 1 ? "multiple-pieces" : "";
        return (
          <div key={cellId} className={`${cell.type} track-${cellId} ${className}`}>
            {cell.Piece.map((piece, i) => {
              const [color] = piece.split("-");
              return <Piece key={i} id={piece} color={color} />;
            })}
          </div>
        );
      })}
      {/* Center Win Zone */}
      {winner && (
  <div className="winner-popup">
    🎉 {winner?.name?.toUpperCase()} wins the game! 🎉
  </div>
)}
    </div>
    
  );
};

export default Board;