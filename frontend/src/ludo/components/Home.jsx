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
    <div id={color+'-home'} className='home' style={{backgroundColor: colorGenerator(color)}}>
      <div className={`home-inner ${isActive ? `${color}-chance` : ""}`}>
        {children}
      </div>
    </div>
  )
}


export default Home