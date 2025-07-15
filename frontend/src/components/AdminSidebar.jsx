import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function AdminSidebar({ onSelect }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const [points, setPoints] = useState(null);

  const fetchPoints = async () => {
    try {
      const res = await axios.get("/admin/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPoints(res.data.points);
    } catch (err) {
      console.error("❌ Failed to fetch point balance", err);
    }
  };

  useEffect(() => {
    if (token) fetchPoints();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  return (
    <div
      style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      <h2>👤 {user?.username || "Guest"}</h2>
      {points !== null && (
        <p style={{ marginTop: "-10px", marginBottom: "10px", color: "#0f0" }}>
          💎 Points: <strong>{points}</strong>
        </p>
      )}
      {user?.role === "creator" && (
  <button
    onClick={async () => {
      const amt = parseInt(prompt("Enter amount to generate:"), 10);
      if (!amt || amt <= 0) return alert("Enter valid amount");
      try {
        const res = await axios.post("/admin/generate-points", { amount: amt }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message);
        setPoints(res.data.points); // update live
      } catch (err) {
        alert("❌ Failed to generate points");
      }
    }}
    style={{
      marginBottom: "10px",
      backgroundColor: "#009933",
      color: "#fff",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }}
  >
    ➕ Generate Points
  </button>
)}

      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        <li onClick={() => onSelect("users")} style={listStyle}>👥 Users</li>
        <li onClick={() => onSelect("refillRequests")} style={listStyle}>💰 Refill Requests</li>
        <li onClick={() => onSelect("withdrawRequests")} style={listStyle}>💸 Withdraw Requests</li>
        <li onClick={() => onSelect("gameHistory")} style={listStyle}>🎮 Game History</li>
      </ul>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "auto",
          color: "#fff",
          background: "#f00",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

const listStyle = {
  margin: "10px 0",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "4px",
  transition: "background 0.2s",
};
