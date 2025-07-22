import React, { useEffect, useState } from "react";
import { useGameContext } from "../context/GameContext";
import socket from "../../utils/socket";

const DicePanel = ({ user, position }) => {
  const { roomId, currentTurnId, myUserId } = useGameContext();
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);

  const isMyTurn = currentTurnId === myUserId && myUserId === user.id;

  const handleRoll = () => {
    if (!isMyTurn || rolling) return;

    setRolling(true);
    socket.emit("roll_dice", { roomId, playerId: myUserId });
  };

  useEffect(() => {
    const onDiceRolled = ({ playerId, value }) => {
      if (playerId === user.id) {
        setDiceValue(value);
      }
      setRolling(false);
    };

    const onTurnChanged = ({ userId }) => {
      setDiceValue(null);
    };

    socket.on("dice_rolled", onDiceRolled);
    socket.on("turn_changed", onTurnChanged);

    return () => {
      socket.off("dice_rolled", onDiceRolled);
      socket.off("turn_changed", onTurnChanged);
    };
  }, [user.id]);

  if (!user) return null;

  return (
    <div className={`absolute ${position} m-4`}>
      <div className="p-4 bg-white rounded-xl shadow-md text-center w-40">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full mx-auto"
        />
        <p className="font-semibold mt-1">{user.name}</p>

        <div className="text-xl mt-2">
          🎲 {diceValue !== null ? `Rolled: ${diceValue}` : "Waiting..."}
        </div>

        {isMyTurn && (
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            {rolling ? "Rolling..." : "Roll Dice"}
          </button>
        )}
      </div>
    </div>
  );
};

export default DicePanel;
