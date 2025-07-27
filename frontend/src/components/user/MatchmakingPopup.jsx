import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";

const availableColors = ["red", "green", "yellow", "blue"];

export default function MatchmakingPopup({
  user,
  selectedPoints,
  selectedMode,
  onMatchSuccess,
  onClose,
}) {
  const [players, setPlayers] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [lockedColors, setLockedColors] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!user || !selectedPoints || !selectedMode) return;

    const selfPlayer = {
      userId: user.id,
      name: user.username,
      avatar: user.avatar || "👤",
    };
    setPlayers([selfPlayer]);

    socket.emit("join_match", {
      userId: user.id,
      name: user.username,
      avatar: user.avatar || "👤",
      points: selectedPoints,
      players: selectedMode,
    });

    socket.on("match_update", (data) => {
      const normalizedPlayers = data.players.map((p) => ({
        userId: p.userId || p.id,
        name: p.name,
        avatar: p.avatar || "👤",
        selectedColor: p.selectedColor || null,
      }));
      setPlayers(normalizedPlayers);
    });

    socket.on("color_selection_start", ({ roomId, availableColors, players }) => {
      const normalizedPlayers = players.map((p) => ({
        userId: p.userId || p.id,
        name: p.name,
        avatar: p.avatar || "👤",
        selectedColor: p.selectedColor || null,
      }));
      setRoomId(roomId);
      setPlayers(normalizedPlayers);
      setLockedColors([]);

      // start/restart countdown
      setCountdown(15);
    });

    socket.on("color_update", ({ userId, color, takenColors }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, selectedColor: color } : p
        )
      );
      setLockedColors(takenColors);
    });

    socket.on("match_found", (data) => {
      onMatchSuccess(data.roomId);
    });

    return () => {
      socket.emit("leave_queue", { userId: user.id });
      setCountdown(null);
      socket.off("match_update");
      socket.off("color_selection_start");
      socket.off("color_update");
      socket.off("match_found");
    };
  }, [user, selectedPoints, selectedMode, onMatchSuccess, onClose]);

  // countdown effect
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleClose = () => {
    socket.emit("leave_queue", { userId: user.id });
    setCountdown(null);
    onClose();
  };

  const handleColorPick = (color) => {
    if (lockedColors.includes(color) || !roomId) return;
    setSelectedColor(color);
    socket.emit("select_color", {
      roomId,
      userId: user.id,
      color,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 text-center shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4 text-yellow-800">
          {roomId ? "Select Your Color" : "Finding Players..."}
        </h2>
        {roomId && countdown !== null && (
          <p className="text-red-500 font-bold text-lg mb-2">
            Auto assign in {countdown}s
          </p>
        )}
        <p className="text-gray-600 mb-2">Mode: {selectedMode}-Player</p>
        <p className="text-gray-600 mb-4">Points: {selectedPoints}</p>

        {/* players */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Array.from({ length: selectedMode }).map((_, i) => {
            const player = players[i];
            return (
              <div
                key={i}
                className={`flex flex-col items-center border rounded-xl p-2 ${
                  player ? "bg-green-100 border-green-400" : "bg-gray-100"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: player?.selectedColor || "gray" }}
                >
                  {player?.avatar || "👤"}
                </div>
                <div className="text-sm mt-1 font-medium text-gray-800">
                  {player?.name || "Waiting..."}
                </div>
              </div>
            );
          })}
        </div>

        {/* color pick */}
        {roomId && (
          <div className="flex justify-center gap-2 mb-4">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorPick(color)}
                disabled={lockedColors.includes(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? "ring-4 ring-black" : ""
                }`}
                style={{
                  backgroundColor: color,
                  opacity: lockedColors.includes(color) ? 0.4 : 1,
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleClose}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
