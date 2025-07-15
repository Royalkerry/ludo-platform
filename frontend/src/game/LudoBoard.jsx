import React from "react";
import { boardMap } from "./boardMap";

function getColorForType(type) {
  switch (type) {
    case 'red-home': return '#e53935';
    case 'green-home': return '#43a047';
    case 'yellow-home': return '#fdd835';
    case 'blue-home': return '#1e88e5';
    case 'red-path': return '#ffcdd2';
    case 'green-path': return '#c8e6c9';
    case 'yellow-path': return '#fff9c4';
    case 'blue-path': return '#bbdefb';
    case 'center': return '#eeeeee';
    case 'blank': return '#ddd';
    default: return '#ffffff';
  }
}

export default function LudoBoard() {
  return (
    <group>
      {boardMap.map((row, y) =>
        row.map((cell, x) => (
          <mesh key={`${x}-${y}`} position={[x - 7, 7 - y, 0]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={getColorForType(cell)} />
          </mesh>
        ))
      )}
    </group>
  );
}
