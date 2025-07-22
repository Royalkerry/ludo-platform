import React from "react";
import { useGameContext } from "../context/GameContext";
import PlayerChance from "./PlayerChance";

import "../styles/Settings.css";
import PlayersRank from "./PlayersRank";

const Settings = ({setBoardRotate }) => {
  const { size, setSize, defaultBoardSize } = useGameContext();

  const boardZoomIn = () => {
    setSize((prev) => ({
      ...prev,
      board: prev.board + 0.05,
    }));
  };

  const boardZoomOut = () => {
    if (size.board > 0.1) {
      setSize((prev) => ({
        ...prev,
        board: prev.board - 0.05,
      }));
    }
  };

  const boardReset = () => {
    setSize({
      dice: 1.2,
      board: defaultBoardSize.current
    })
  }

  const diceZoomIn = () => {
    console.log(size.dice); 
    setSize((prev) => ({
      ...prev,
      dice: prev.dice + 0.05,
    }));
  };

  const diceZoomOut = () => {
    console.log(size.dice);
    if (size.dice > 0.1) {
      setSize((prev) => ({
        ...prev,
        dice: prev.dice - 0.05,
      }));
    }
  }
  
  const rotateLeft = () => {
    setBoardRotate((prev) => prev + 90);
  }

  const rotateRight = () => {
    setBoardRotate((prev) => prev - 90);
  }

  const resetRotate = () => {
    setBoardRotate(0);
  }

  return (
    <div id="settings">
      <div>
        <div className="players-data">
          <div className="current-player-chance">
          <PlayerChance />
          </div>
          <PlayersRank />
        </div>
        <div className="game-settings">
        <div className="zoom-settings text-gray-500 italic">
  Zoom disabled for this device.
</div>
        <div className="vertical-line"></div>
        <div className="rotate-settings">
          <p>rotate</p>
          <div className="rotate-btn">
            <div>
            <span className="material-symbols-outlined icons" onClick={rotateLeft}>rotate_left</span>
            <span>rotate</span>
            <span className="material-symbols-outlined icons" onClick={rotateRight}>rotate_right</span>
            </div>
            <div>
            <span className="reset-btn" onClick={resetRotate}><u>Reset</u></span> 
            </div>
          </div> 
        </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
