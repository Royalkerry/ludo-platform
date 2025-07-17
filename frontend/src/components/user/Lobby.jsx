import React from "react";
import MatchOptions from "./MatchOptions";
import useRoleGuard from "@/hooks/useRoleGuard";
import Sidebar from "../user/layout/Sidebar";


export default function Lobby() {
  useRoleGuard("user");
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", background: "#f4f4f4" }}>
        <h2 style={{ marginBottom: "20px", color:"#ffaa00" }}>🎮 Welcome to the Ludo Lobby</h2>
        <MatchOptions />
        {/* You can add room list, game preview, or stats here later */}
      </div>
    </div>
  );
}
