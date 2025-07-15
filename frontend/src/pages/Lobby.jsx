// src/pages/Lobby.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGameStore from "../store/gameStore";

export default function Lobby() {
  const navigate = useNavigate();
  const {
    username,
    setUsername,
    setGameType,
    setCoinAmount,
    setRoom,
  } = useGameStore();

  const [localGameType, setLocalGameType] = useState("2-player");
  const [coin, setCoin] = useState(100);
  const [roomId, setRoomId] = useState("");

  // ✅ Protect Lobby: Only accessible if logged in
  useEffect(() => {
    if (!username) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.username) {
        setUsername(storedUser.username); // Set into Zustand store
      } else {
        navigate("/"); // ⛔ No login found, redirect to login page
      }
    }
  }, [username, setUsername, navigate]);

  const handleAutoMatch = () => {
    setGameType(localGameType);
    setCoinAmount(coin);
    setRoom(""); // 🔁 No specific room
    navigate("/game");
  };

  const handleCreateRoom = () => {
    const generatedRoomId = Math.random().toString(36).substr(2, 6);
    setRoom(generatedRoomId);
    setGameType(localGameType);
    setCoinAmount(coin);
    navigate("/game");
  };

  const handleJoinRoom = () => {
    if (!roomId) return alert("Enter a Room ID to join");
    setRoom(roomId);
    setGameType(localGameType);
    setCoinAmount(coin);
    navigate("/game");
  };
  // ✅ Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    navigate("/"); // Redirect to login
  };

  return (
    <div style={{ padding: 30, color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🎯 Ludo Lobby</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#f00", color: "#fff", border: "none", borderRadius: 4 }}>
          🚪 Logout
        </button>
      </div>

      <p>Welcome, <strong>{username}</strong> 👋</p>
      <div style={{ marginBottom: 20 }}>
        <label>🎮 Select Game Type:</label>
        <br />
        <select
          value={localGameType}
          onChange={(e) => setLocalGameType(e.target.value)}
          style={{ padding: "8px", marginTop: "4px" }}
        >
          <option value="2-player">2 Player</option>
          <option value="4-player">4 Player</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>💰 Select Coin Amount:</label>
        <br />
        <select
          value={coin}
          onChange={(e) => setCoin(parseInt(e.target.value))}
          style={{ padding: "8px", marginTop: "4px" }}
        >
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
          <option value={2000}>2000</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={handleAutoMatch} style={{ marginRight: 10 }}>
          🔍 Auto Match
        </button>
        <button onClick={handleCreateRoom}>🏠 Create Room</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>🔗 Enter Room ID</label>
        <br />
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: "8px", marginTop: "4px", marginRight: "10px" }}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
}
