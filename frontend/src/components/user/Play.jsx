import React from "react";
import { GameProvider } from "../../ludo/context/GameContext";
import GameScreen from "./GameScreen"; // 👈 Separate component using context

const Play = () => {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
};

export default Play;
