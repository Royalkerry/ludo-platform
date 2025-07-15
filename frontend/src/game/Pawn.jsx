import React from "react";
import { Sphere } from "@react-three/drei";
import { Vector3 } from "three";
import useGameStore from "../store/gameStore";
import { paths } from "../utils/ludoPaths";
import socket from "../socket";

export default function Pawn({ id, color, index }) {
  const movePawn = useGameStore((s) => s.movePawn);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const pawnColor = id.split("-")[0];

  const roomId = localStorage.getItem("roomId");

  const handleClick = () => {
    if (pawnColor !== currentPlayer) return;
    movePawn(id);

    const path = paths[color];
    if (index + 1 < path.length) {
      socket.emit("pawnMove", {
        id,
        index: index + 1,
        roomId
      });
    }
  };

  const path = paths[color];
  const position = index >= 0 ? path[index] : new Vector3(...homePosition(color, id));

  return (
    <Sphere args={[0.3, 16, 16]} position={position} onClick={handleClick}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
}

function homePosition(color, id) {
  const offsets = {
    red: [-3, 0.3, -3],
    green: [3, 0.3, -3],
    yellow: [3, 0.3, 3],
    blue: [-3, 0.3, 3]
  };
  const base = offsets[color];
  const n = parseInt(id.split("-")[1]);

  return [
    base[0] + (n % 2) * 1,
    base[1],
    base[2] + Math.floor(n / 2) * 1
  ];
}
