import React from 'react'
import '../styles/Square.css'
import { useGameContext } from '../context/GameContext'
import Piece from './Piece'

const Square = () => {

  const { userPositions } = useGameContext();

  const redWinner = userPositions['red'].map((position, index) => {
    return position === 999 ? <Piece key={index} id={`red-${index}`} color={'red'} /> : null;
  });

  const yellowWinner = userPositions['yellow'].map((position, index) => {
    return position === 999 ? <Piece key={index} id={`yellow-${index}`} color={'yellow'} /> : null;
  });

  const greenWinner = userPositions['green'].map((position, index) => {
    return position === 999 ? <Piece key={index} id={`green-${index}`} color={'green'} /> : null;
  });

  const blueWinner = userPositions['blue'].map((position, index) => {
    return position === 999 ? <Piece key={index} id={`blue-${index}`} color={'blue'} /> : null;
  });

  return (
  <div id="win-win" className="square">
    <div className="win-containers">
    <div className="win-color yellow-win">
    <div className='winner-collecting wc-yellow'>
      {yellowWinner}
      </div>
    </div>
    <div className="win-color green-win">
    <div className='winner-collecting wc-green'>
      {greenWinner}
      </div>
    </div>
    <div className="win-color red-win">
    <div className='winner-collecting wc-red'>
      {redWinner}
      </div>
    </div>
    <div className="win-color blue-win">
      <div className='winner-collecting wc-blue'>
      {blueWinner}
      </div>
    </div>
</div>

  </div>
  )
}

export default Square