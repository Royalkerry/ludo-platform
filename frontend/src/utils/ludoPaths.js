import { Vector3 } from "three";

const createPath = (color) => {
  const path = [];

  // Dummy straight-line path
  for (let i = 0; i < 52; i++) {
    const angle = (i / 52) * Math.PI * 2;
    path.push(new Vector3(Math.cos(angle) * 6, 0.4, Math.sin(angle) * 6));
  }

  return path;
};

export const paths = {
  red: createPath("red"),
  green: createPath("green"),
  blue: createPath("blue"),
  yellow: createPath("yellow")
};
