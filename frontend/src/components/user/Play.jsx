import React from 'react';
import { GameProvider } from '../game/ludo/context/GameContext';
import Board from '../game/ludo/components/Board';
import DicePanel from '../game/ludo/components/DicePanel';

export default function PlayLudo() {
  return (
    <GameProvider>
      <div className="flex items-center justify-center w-full h-screen bg-black">
        {/* Outer container to position dice and board */}
        <div className="relative w-[90vmin] h-[90vmin] max-w-[600px] max-h-[600px]">
          
          {/* Dice Panels - absolutely positioned around board */}
          <DicePanel position="top-left" playerColor="red" />
          <DicePanel position="top-right" playerColor="blue" />
          <DicePanel position="bottom-left" playerColor="green" />
          <DicePanel position="bottom-right" playerColor="yellow" />

          {/* Center Board */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Board />
          </div>
        </div>
      </div>
    </GameProvider>
  );
}
