// src/components/admin/GameHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; // 

export default function GameHistory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/game/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGames(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch game history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", color: "#333" }}>
      <h2>🎮 Game History</h2>
      {games.length === 0 ? (
        <p>No game records found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={cell}>Room</th>
              <th style={cell}>Players</th>
              <th style={cell}>Winner</th>
              <th style={cell}>Points</th>
              <th style={cell}>Type</th>
              <th style={cell}>Ended At</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id}>
                <td style={cell}>{g.roomId}</td>
                <td style={cell}>
                  {g.players?.map((p) => p.username).join(", ")}
                </td>
                <td style={cell}>{g.winnerId}</td>
                <td style={cell}>{g.pointsWon}</td>
                <td style={cell}>{g.gameType}</td>
                <td style={cell}>{new Date(g.endedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cell = {
  border: "1px solid #ccc",
  padding: "8px",
};
