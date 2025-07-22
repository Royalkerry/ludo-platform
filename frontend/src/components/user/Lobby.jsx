import React from "react";
import MatchOptions from "./MatchOptions";
import useRoleGuard from "@/hooks/useRoleGuard";
import Sidebar from "../user/layout/Sidebar";
import TopBar from "../user/layout/TopBar"; // ✅ Import TopBar

export default function Lobby() {
  useRoleGuard("user");

  return (
    <div className="relative min-h-screen">
      <TopBar /> {/* 👤💰 Username and coins */}
      
      <div style={{ display: "flex", height: "100%" }} className="pt-12"> {/* Add padding for fixed TopBar */}
        <Sidebar />

        <div style={{ flex: 1, padding: "20px", background: "#f4f4f4" }}>
          <h2 style={{ marginBottom: "20px", color: "#ffaa00" }}>
            🎮 Welcome to the Ludo Lobby
          </h2>
          <MatchOptions />
          {/* You can add room list, game preview, or stats here later */}
        </div>
      </div>
    </div>
  );
}
