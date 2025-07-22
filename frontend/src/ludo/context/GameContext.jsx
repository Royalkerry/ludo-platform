// src/ludo/context/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../../utils/socket';

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [users, setUsers] = useState([]); // array of { id, name, avatar, token }
  const [playerPositions, setPlayerPositions] = useState({
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  });
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    socket.on('your_id', (userId) => {
      setMyUserId(userId);
    });

    socket.on('room_info', ({ roomId, users, you }) => {
      setRoomId(roomId);
      setUsers(users);
      setMyUserId(you?.id);
    });

    socket.on('position_update', (positions) => {
      setPlayerPositions(positions);
    });

    socket.on('turn_update', (userId) => {
      setCurrentTurnId(userId);
    });

    return () => {
      socket.off('your_id');
      socket.off('room_info');
      socket.off('position_update');
      socket.off('turn_update');
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        roomId,
        users,
        playerPositions,
        setPlayerPositions,
        currentTurnId,
        myUserId,
        setRoomId,
        setUsers,
        setMyUserId,
        setCurrentTurnId
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
