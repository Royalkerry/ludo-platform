import React from "react";
import Board3D from "../components/Board3D";
import Dice from "../components/Dice";

export default function Game() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Board3D />
      <Dice />
    </div>
  );
}
