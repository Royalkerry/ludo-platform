import React from 'react'
import '../styles/Home.css'
import { useGameContext } from '../context/GameContext';

const Home = ({color, children}) => {

  const { currentColor } = useGameContext();
  const isActive = currentColor === color;

  function colorGenerator(color) {
    switch(color) {
      case 'red':
        return '#B22222';
      case 'blue':
        return '#1034A6';
      case 'green':
        return '#228B22';
      case 'yellow':
        return '#F4C431';
      default:
        return 'white';
    }
  }
  
  
  return (
    <div
      id={color + '-home'}
      className="home relative"
      style={{ backgroundColor: colorGenerator(color) }}
    >
      <div className={`home-inner ${isActive ? `${color}-chance` : ""} relative w-full h-full`}>
        
        {/* --- 2x2 Placeholder Circles --- */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 place-items-center opacity-50 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-5"
              style={{ borderColor: colorGenerator(color) }}
            />
          ))}
        </div>

        {/* --- Pawns --- */}
        {children}
      </div>
    </div>
  )
}


export default Home