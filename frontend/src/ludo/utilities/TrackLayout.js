const trackLayout = {};

const createTrack = (type, piece = []) => ({ type, Piece: piece });

const START_CELLS = {
  red: 1,
  yellow: 14,
  green: 27,
  blue: 40,
};

const STOP_POSITIONS = [9, 22, 35, 48];
const FINAL_POSITIONS = { red: 101, yellow: 201, green: 301, blue: 401 };

// Normal tracks
for (let i = 1; i <= 52; i++) {
  let type = "";
  if (i === START_CELLS.red) type = "red start";
  else if (i === START_CELLS.yellow) type = "yellow start";
  else if (i === START_CELLS.green) type = "green start";
  else if (i === START_CELLS.blue) type = "blue start";
  else if (STOP_POSITIONS.includes(i)) type = "safe";
  trackLayout[i] = createTrack(type);
}

// Final paths
Object.entries(FINAL_POSITIONS).forEach(([color, start]) => {
  for (let i = start; i <= start + 4; i++) {
    trackLayout[i] = createTrack(`${color} final`);
  }
});

// Winner zone
trackLayout["ww"] = createTrack("winner");

export default trackLayout;