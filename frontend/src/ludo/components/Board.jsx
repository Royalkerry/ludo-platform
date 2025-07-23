import React, { useState, useEffect, Children } from "react";
import Piece from "./Piece";
import Home from "./Home";
import Square from "./Square";
import trackLayout from "../utilities/TrackLayout";
import { useGameContext } from "../context/GameContext";
import "../styles/Board.css";

const Board = () => {
  const { playerPositions, users, currentTurnId } = useGameContext();
  const [layout, setLayout] = useState(trackLayout);

  // Current player color
  const currentPlayer = users.find((u) => u.id === currentTurnId);
  const currentColor = currentPlayer?.color;

  useEffect(() => {
    const updatedLayout = { ...trackLayout };
    Object.values(updatedLayout).forEach((cell) => (cell.Piece = []));
    Object.entries(playerPositions).forEach(([color, positions]) => {
      positions.forEach((pos, index) => {
        if (![0, 106, 206, 306, 406].includes(pos)) {
          updatedLayout[pos]?.Piece.push(`${color}-${index}`);
        }
      });
    });
    setLayout(updatedLayout);
  }, [playerPositions]);
  
  return (
    <div id="board" className="relative mx-auto">
      {/* Homes with glow for current turn */}
      {["red", "green", "yellow", "blue"].map((color) => (
        <Home
          key={color}
          color={color}
          className={color === currentColor ? "glow-home" : ""}
        >
          {playerPositions[color]?.map((position, index) =>
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
    </div>
    
  );
};

export default Board;
