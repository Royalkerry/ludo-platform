// src/components/TopBar.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
        console.error("TopBar: Failed to fetch user info", err);
        localStorage.clear();
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="fixed top-0 left-0 w-full bg-blue-900 text-white flex justify-between items-center px-4 py-2 shadow-md z-50">
      <span className="text-sm font-semibold truncate">👤 {user?.username || "Guest"}</span>
      <span className="text-sm font-semibold">💰 {user?.points ?? 0}</span>
    </div>
  );
};

export default TopBar;
