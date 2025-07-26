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

// ---- Normal tracks ----
for (let i = 1; i <= 52; i++) {
  let type = "track";
  if (i === START_CELLS.red) type = "track red start";
  else if (i === START_CELLS.yellow) type = "track yellow start";
  else if (i === START_CELLS.green) type = "track green start";
  else if (i === START_CELLS.blue) type = "track blue start";
  else if (STOP_POSITIONS.includes(i)) type = "track safe";

  trackLayout[i] = createTrack(type);
}

// ---- Final paths ----
Object.entries(FINAL_POSITIONS).forEach(([color, start]) => {
  for (let i = start; i <= start + 4; i++) {
    trackLayout[i] = createTrack(`track ${color} final`);
  }
  
});


export default trackLayout;
