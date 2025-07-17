import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaPlus, FaUsers, FaCoins, FaSignOutAlt } from "react-icons/fa";

const BottomNav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around items-center py-2 z-50 border-t border-gray-700">

      <button onClick={() => navigate("/lobby")}><FaHome /></button>
      <button onClick={() => navigate("/create-room")}><FaPlus /></button>
      <button onClick={() => navigate("/join-room")}><FaUsers /></button>
      <button onClick={() => navigate("/refill")}><FaCoins /></button>
      <button onClick={() => navigate("/withdraw")}><FaCoins /></button>
      <button onClick={handleLogout}><FaSignOutAlt /></button>
    </nav>
  );
};

export default BottomNav;
