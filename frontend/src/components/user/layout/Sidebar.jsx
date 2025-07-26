import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/"); 
      return;
    }

    axios
      .get("/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Failed to fetch user info", err);
        localStorage.clear();
        navigate("/");
      });
  }, [navigate]);

  const menuItems = [
    { label: "Lobby", icon: "🏠", path: "/lobby" },
    { label: "Create Ludo Room", icon: "🎮", path: "/create-room" },
    { label: "Join Room", icon: "🤝", path: "/join-room" },
    { label: "Refill Coins", icon: "💸", path: "/refill" },
    { label: "Withdraw", icon: "🧾", path: "/withdraw" },
    { label: "My Requests", icon: "📋", path: "/my-requests" },
    { label: "History", icon: "📜", path: "/transaction" },
    { label: "Game Result", icon: "🏁", path: "/gameresult" },
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
    <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen 
  flex-col bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-6 shadow-lg">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">👋 Welcome</h2>
        <h3 className="text-lg font-bold text-yellow-300">{user?.username}</h3>
        <p className="text-sm text-gray-300">💰 {user?.points ?? 0} coins</p>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {menuItems.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 px-4 py-2 rounded-md 
              hover:bg-[#334155] cursor-pointer transition"
            onClick={() => (item.path ? navigate(item.path) : item.action())}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
