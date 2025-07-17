// components/DicePanel.jsx
import React from 'react';
import Dice from './Dice';



import { useGameContext } from '../context/GameContext';
const positionClass = {
    'top-left': 'absolute -top-35 -left-0 z-50',
    'top-right': 'absolute -top-35 -right-0 z-50',
    'bottom-left': 'absolute -bottom-35 -left-0 z-50',
    'bottom-right': 'absolute -bottom-35 -right-0 z-50',
  };
  
  
  
  
  const DicePanel = ({ position = "top-left", playerColor }) => {
    const { currentPlayer } = useGameContext();
    const isCurrent = currentPlayer === playerColor;
  
    return (
      <div className={`absolute ${positionClass[position]} flex flex-col items-center gap-2`}>
        <div className="text-white text-sm font-bold capitalize">{playerColor}</div>
        {isCurrent && <Dice />}
      </div>
    );
  };
  
export default DicePanel;
