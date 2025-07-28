// src/components/admin/GameHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

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

  return (
    <div className="p-4 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎮 Game History</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : games.length === 0 ? (
        <div className="text-center text-gray-500 italic">No game records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow-sm text-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-3 border text-left">🏠 Room</th>
                <th className="px-4 py-3 border text-left">👥 users</th>
                <th className="px-4 py-3 border text-left">🏆 Winner</th>
                <th className="px-4 py-3 border text-left">💎 Points</th>
                <th className="px-4 py-3 border text-left">🎲 Type</th>
                <th className="px-4 py-3 border text-left">🕒 Ended At</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{g.roomId}</td>
                  <td className="border px-4 py-2">{g.users?.map((p) => p.username).join(", ")}</td>
                  <td className="border px-4 py-2">{g.winnerId}</td>
                  <td className="border px-4 py-2 text-green-700 font-semibold">{g.pointsWon}</td>
                  <td className="border px-4 py-2 capitalize">{g.gameType}</td>
                  <td className="border px-4 py-2 text-gray-600">
                    {new Date(g.endedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
