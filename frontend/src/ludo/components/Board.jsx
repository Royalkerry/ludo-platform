import React, { useState, useEffect } from 'react';
import Piece from './Piece';
import Home from './Home';
import Square from './Square';
import trackLayout from '../utilities/TrackLayout';
import { useGameContext } from '../context/GameContext';
import '../styles/Board.css';
import DicePanel from './DicePanel'; 
const Board = () => {
  const { playerPositions, users, currentTurnId } = useGameContext();
  const [layout, setLayout] = useState(trackLayout);

  // Sync piece positions with track layout
  useEffect(() => {
    const updatedLayout = { ...trackLayout };

    // Clear all pieces
    Object.values(updatedLayout).forEach((cell) => {
      cell.Piece = [];
    });

    // Place each piece
    Object.entries(playerPositions).forEach(([color, positions]) => {
      positions.forEach((pos, index) => {
        if (![0, 106, 206, 306, 406].includes(pos)) {
          updatedLayout[pos]?.Piece.push(`${color}-${index}`);
        }
      });
    });

    setLayout(updatedLayout);
  }, [playerPositions]);

  // Position mapping for DicePanels
  const dicePositions = {
    red: "top-left",
    blue: "top-right",
    green: "bottom-left",
    yellow: "bottom-right",
  };

  // Helper to get user info by token
  const getUserByToken = (tokenColor) =>
    users.find((u) => u.token === tokenColor);

  return (
    <div id="board" className="w-full h-full relative">
      {/* DicePanels at corners */}
      {["red", "blue", "green", "yellow"].map((color) => {
        const user = getUserByToken(color);
        if (!user) return null;
        return (
          <DicePanel
            key={color}
            user={user}
            position={dicePositions[color]}
            isMyTurn={user.userId === currentTurnId}
          />
        );
      })}

      {/* Homes with pieces in base */}
      {["red", "green", "yellow", "blue"].map((color) => (
        <Home key={color} color={color}>
          {playerPositions[color]?.map((position, index) => {
            if (position === 0) {
              return (
                <Piece key={index} id={`${color}-${index}`} color={color} />
              );
            }
            return null;
          })}
        </Home>
      ))}

      {/* Squares in the layout */}
      <Square />

      {/* Track layout pieces */}
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