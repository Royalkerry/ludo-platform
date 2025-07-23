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
      console.log("🔄 match_update:", normalizedPlayers);
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
    });

    socket.on("color_update", ({ userId, color, takenColors }) => {
      console.log(`🎨 color_update received: userId=${userId}, color=${color}, takenColors=`, takenColors);
      setPlayers((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, selectedColor: color } : p
        )
      );
      setLockedColors(takenColors);
    });

    socket.on("color_error", ({ message }) => {
      console.log(`❌ color_error: ${message}`);
      alert(message); // Replace with toast/notification if available
    });

    socket.on("match_found", (data) => {
      console.log("✅ match_found:", data);
      onMatchSuccess(data.roomId);
    });

    return () => {
      socket.emit("leave_queue", { userId: user.id });
      socket.off("match_update");
      socket.off("color_selection_start");
      socket.off("color_update");
      socket.off("color_error");
      socket.off("match_found");
    };
  }, [user, selectedPoints, selectedMode, onMatchSuccess, onClose]);

  const handleColorPick = (color) => {
    if (lockedColors.includes(color) || !roomId) {
      console.log(`⚠️ Cannot pick color ${color}: roomId=${roomId}, lockedColors=`, lockedColors);
      return;
    }
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
        <h2 className="text-xl font-bold mb-4 text-yellow-800">Finding Players...</h2>
        <p className="text-gray-600 mb-2">Mode: {selectedMode}-Player</p>
        <p className="text-gray-600 mb-4">Points: {selectedPoints}</p>

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
                  style={{
                    backgroundColor: player?.selectedColor || "gray",
                  }}
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

        <button
          onClick={onClose}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}