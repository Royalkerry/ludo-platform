import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LobbySidebar.css";
import axios from "@/utils/axiosInstance";

const LobbySidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch user info from backend using stored token
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/"); // Redirect to login if token is missing
      return;
    }

    axios
      .get("/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Failed to fetch user info", err);
        localStorage.clear();
        navigate("/"); // Logout on error
      });
  }, [navigate]);

  const menuItems = [
    { label: "Lobby", icon: "🏠", action: () => navigate("/lobby") },
    { label: "Create Ludo Room", icon: "🎮", action: () => navigate("/create-room") },
    { label: "Join Room", icon: "🤝", action: () => navigate("/join-room") },
    { label: "Refill Coins", icon: "💸", action: () => navigate("/refill") },
    { label: "Withdraw", icon: "🧾", action: () => navigate("/withdraw") },
    { label: "MyRequests", icon: "📋", action: () => navigate("/my-requests") },
    { label: "History", icon: "📜", action: () => navigate("/transaction") },
    { label: "Game Result", icon: "🏁", action: () => navigate("/gameresult") },
    {
      label: "Logout",
      icon: "🚪",
      action: () => {
        localStorage.clear();
        navigate("/");
      },
    },
  ];

  return (
    <div className="lobby-sidebar">
      <div className="sidebar-header">
        <h2>👋 Welcome</h2>
        <h3><b>{user?.username}</b></h3>
        <p>💰 <b>{user?.points ?? 0}</b> coins</p>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item, idx) => (
          <li key={idx} onClick={item.action}>
            <span>{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbySidebar;
