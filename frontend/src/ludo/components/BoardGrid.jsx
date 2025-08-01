// BoardGrid.jsx
import React from 'react';

const BoardGrid = () => {
  const grid = [];

  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      let bg = 'bg-white'; // default

      // Red Home
      if (x < 6 && y < 6) bg = 'bg-red-500';

      // Yellow Home
      if (x > 8 && y < 6) bg = 'bg-yellow-400';

      // Green Home
      if (x < 6 && y > 8) bg = 'bg-green-500';

      // Blue Home
      if (x > 8 && y > 8) bg = 'bg-blue-500';

      // Center Winner Zone
      if (x >= 6 && x <= 8 && y >= 6 && y <= 8) bg = 'bg-white';

      // You can color track path here as well if needed using coordinate logic

      grid.push(
        <div
          key={`${x}-${y}`}
          className={`w-8 h-8 border border-gray-300 ${bg} relative`}
        >
          <span className="absolute text-[10px] bottom-0 right-0 text-gray-600">{x},{y}</span>
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-15 grid-rows-15 w-fit mx-auto">
      {grid}
    </div>
  );
};

export default BoardGrid;
