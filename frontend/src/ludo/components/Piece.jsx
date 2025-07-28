import React from 'react';
import { useGameContext } from '../context/GameContext';
import socket from '../../utils/socket';
import '../styles/Piece.css';

const Piece = ({ color, id }) => {
  const { roomId, currentTurnId, myUserId, diceValues, users } = useGameContext();

  const make_a_move = () => {
    const [pieceColor, indexStr] = id.split('-');
    const index = parseInt(indexStr, 10);

    // Whose turn है check करो
    const currentUser = users.find((u) => u.id === currentTurnId);
    if (!currentUser || currentUser.id !== myUserId) return;

    const diceValue = diceValues[currentTurnId];
    if (!diceValue) return; // अभी dice नहीं फेंका गया

    socket.emit('piece_moved', {
      roomId,
      color: pieceColor,
      pawnIndex: index,
      steps: diceValue,
    });
  };

  function colorGenerator(color) {
    switch (color) {
      case 'red':
        return '#FF0800';
      case 'blue':
        return '#0000FF';
      case 'green':
        return '#4CBB17';
      case 'yellow':
        return '#FFC40C';
      default:
        return 'white';
    }
  }

  return (
    <div
      id={id}
      className="piece"
      style={{ backgroundColor: colorGenerator(color) }}
      onClick={make_a_move}
    >
      <div className="piece-inner"></div>
    </div>
  );
};

export default Piece;
