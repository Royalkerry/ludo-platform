import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; // use real axios when backend ready
import { useNavigate } from "react-router-dom";

export default function MatchOptions() {
  const [availableUsers, setAvailableUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user")); // to avoid showing self
  const navigate = useNavigate();

  useEffect(() => {
    // 🚨 Replace this with real API later
    setTimeout(() => {
      setAvailableUsers([
        { id: 1, username: "kerry" },
        { id: 2, username: "rohan" },
        { id: 3, username: "shyam" },
      ]);
    }, 300);
  }, []);

  const handleChallenge = (user) => {
    alert(`🔔 Challenge sent to ${user.username}`);
    // Later: emit socket event or call backend
  };

  const gameModes = [
    { title: "2 Player", image: "/assets/images/2player.jpg" },
    { title: "4 Player", image: "/assets/images/4player.jpg" },
    { title: "Tournament", image: "/assets/images/tournament.jpg" },
  ];
  const handleGameModeClick = (mode) => {
    localStorage.setItem("gameMode", mode.key); // e.g. "2player"
    navigate("/play");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-center text-yellow-600 mb-8">
        🎯 Choose Your Game Mode
      </h2>

      {/* Game Mode Cards */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {gameModes.map((mode, i) => (
          <div
            key={i}
            className="w-40 cursor-pointer border-2 border-gray-300 bg-white rounded-xl shadow-md hover:scale-105 transform transition"
            onClick={() => {
              localStorage.setItem("gameMode", mode.title.toLowerCase());
              navigate("/play");
            }}
          >
            <img
              src={mode.image}
              alt={mode.title}
              className="rounded-t-xl h-28 w-full object-cover"
            />
            <h3 className="text-center py-2 font-semibold text-gray-800">
              {mode.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Available Users */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          👥 Available Users
        </h3>
        {availableUsers.filter((u) => u.id !== currentUser?.id).length === 0 ? (
          <p className="text-gray-600">No users available to challenge</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {availableUsers
              .filter((u) => u.id !== currentUser?.id)
              .map((user) => (
                <li key={user.id} className="flex justify-between items-center py-3">
                  <span className="text-gray-700">{user.username}</span>
                  <button
                    onClick={() => handleChallenge(user)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                  >
                    Challenge
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}