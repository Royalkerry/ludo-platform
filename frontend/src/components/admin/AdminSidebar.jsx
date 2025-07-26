// src/components/admin/AdminSidebar.jsx
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; 

export default function AdminSidebar({ onSelect, isOpen, onClose }) {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // assuming API returns { username, role, points }
      setProfile(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch profile", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 text-white px-4 py-5 flex flex-col shadow-lg transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen`}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">👤 {profile?.username || "Loading..."}</h2>
          <h3 className="text-sm text-yellow-400 capitalize">{profile?.role}</h3>
          {profile?.points !== undefined && (
            <p className="text-green-400 mt-2 text-sm">
              💎 Points: <strong>{profile.points}</strong>
            </p>
          )}
        </div>

        {profile?.role === "creator" && (
          <button
            onClick={async () => {
              const amt = parseInt(prompt("Enter amount to generate:"), 10);
              if (!amt || amt <= 0) return alert("Enter valid amount");
              try {
                const res = await axios.post(
                  "/admin/generate-points",
                  { amount: amt },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(res.data.message);
                setProfile((prev) => ({ ...prev, points: res.data.points }));
              } catch (err) {
                alert("❌ Failed to generate points");
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded mb-4 text-sm"
          >
            ➕ Generate Points
          </button>
        )}

        <ul className="space-y-2 text-sm">
          <li
            className="cursor-pointer hover:bg-gray-700 px-3 py-2 rounded"
            onClick={() => {
              onSelect("users");
              onClose();
            }}
          >
            👥 Users
          </li>

          {profile?.role === "master" && (
            <>
              <li
                className="cursor-pointer hover:bg-gray-700 px-3 py-2 rounded"
                onClick={() => {
                  onSelect("refillRequests");
                  onClose();
                }}
              >
                💰 Refill Requests
              </li>
              <li
                className="cursor-pointer hover:bg-gray-700 px-3 py-2 rounded"
                onClick={() => {
                  onSelect("withdrawRequests");
                  onClose();
                }}
              >
                💸 Withdraw Requests
              </li>
            </>
          )}

          <li
            className="cursor-pointer hover:bg-gray-700 px-3 py-2 rounded"
            onClick={() => {
              onSelect("gameHistory");
              onClose();
            }}
          >
            🎮 Game History
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </>
  );
}
