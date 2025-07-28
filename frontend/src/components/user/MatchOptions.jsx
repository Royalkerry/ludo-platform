import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";
import MatchmakingPopup from "../user/MatchmakingPopup";
import axios from "../../utils/axiosInstance";

const pointOptions = [100, 200, 300, 400, 500, 1000, 2000];

export default function MatchOptions() {
  const navigate = useNavigate();
  const [selectedPoints, setSelectedPoints] = useState(100);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [roomIdToRejoin, setRoomIdToRejoin] = useState(null);
  const [popupMode, setPopupMode] = useState("new");   // <-- added
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/user/me")
      .then(res => setUser(res.data))
      .catch(err => console.error("Failed to fetch user", err));
  }, []);

  // ===== SOCKET EVENTS =====
  useEffect(() => {
    socket.on("active_room_found", ({ roomId }) => {
      setRoomIdToRejoin(roomId);
      setShowChoice(true);
    });

    socket.on("no_active_room", () => {
      setPopupMode("new");        // directly go to new game
      setShowPopup(true);
    });

    socket.on("rejoin_failed", () => {
      alert("No active game found, starting new one!");
      setPopupMode("new");
      setShowPopup(true);
    });

    return () => {
      socket.off("active_room_found");
      socket.off("no_active_room");
      socket.off("rejoin_failed");
    };
  }, []);

  const handlePlay = (users) => {
    setSelectedMode(users);
    socket.emit("check_active_room", { userId: user.id });
  };

  const handleMatchSuccess = (roomId, users) => {
    setShowPopup(false);
    navigate(`/play?roomId=${roomId}`, { state: { users } });
  };

  const changePoints = (delta) => {
    const currentIndex = pointOptions.indexOf(selectedPoints);
    const newIndex = currentIndex + delta;
    if (newIndex >= 0 && newIndex < pointOptions.length) {
      setSelectedPoints(pointOptions[newIndex]);
    }
  };

  const handleRejoin = () => {
    setShowChoice(false);
    setPopupMode("rejoin");
    socket.emit("rejoin_request", { userId: user.id });
    setShowPopup(true);
  };

  const handleNewGame = () => {
    setShowChoice(false);
    setPopupMode("new");
    setShowPopup(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-gradient-to-b from-yellow-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-800 mt-6">Choose Game Mode</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {[2, 4].map((users) => (
          <div key={users} className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">{users}-User Game</h3>
            <div className="flex items-center justify-center gap-4 my-3">
              <button onClick={() => changePoints(-1)} className="w-9 h-9 rounded-full bg-yellow-300 text-xl font-bold shadow hover:bg-yellow-400">–</button>
              <span className="text-xl font-bold text-yellow-900">{selectedPoints}</span>
              <button onClick={() => changePoints(1)} className="w-9 h-9 rounded-full bg-yellow-300 text-xl font-bold shadow hover:bg-yellow-400">+</button>
            </div>
            <div className="text-sm text-gray-800 mb-1">Entry: {selectedPoints} coins</div>
            <div className="text-sm text-green-700 font-semibold mb-4">Win: {selectedPoints * users} coins</div>
            <button
              onClick={() => handlePlay(users)}
              className="w-32 py-2 bg-yellow-500 text-white font-semibold rounded-full shadow-md hover:bg-yellow-600 transition"
            >
              Play
            </button>
          </div>
        ))}
      </div>

      {showChoice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">You have an unfinished game</h2>
            <p className="mb-4">Do you want to rejoin or start a new game?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleRejoin} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Rejoin</button>
              <button onClick={handleNewGame} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">New Game</button>
            </div>
          </div>
        </div>
      )}

      {showPopup && user && (
        <MatchmakingPopup
          user={user}
          selectedPoints={selectedPoints}
          selectedMode={selectedMode}
          onMatchSuccess={handleMatchSuccess}
          onClose={() => setShowPopup(false)}
          mode={popupMode}    // <-- pass mode dynamically
        />
      )}
    </div>
  );
}
