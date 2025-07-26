import React from "react";
import MatchOptions from "./MatchOptions";
import useRoleGuard from "@/hooks/useRoleGuard";


export default function Lobby() {
  useRoleGuard("user");

  return (
    <div className= "p-5 bg-gray-100 min-h-screen">
      <h2 className="mb-5 text-[#ffaa00] "> 🎮 Welcome to the Ludo Lobby</h2>
      <MatchOptions />
      </div>
  );
}
