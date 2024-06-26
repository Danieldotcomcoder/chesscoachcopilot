import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './chessboard.css';

const ChessBoard = ({ moves, name }) => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState('start');

  useEffect(() => {
    const chess = new Chess();
    const moveList = moves.split(' ');

    moveList.forEach(move => {
      chess.move(move);
    });

    setGame(chess);
    setPosition(chess.fen());
  }, [moves]);

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // auto promote to a queen for simplicity
      });

      if (move === null) {
        throw new Error("Illegal move");
      }

      setPosition(game.fen());
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  return (
    <div className='chessboard'>
      <h3 className='position-name'>
        Chess Position Name: {name}
      </h3>
      <Chessboard position={position} onPieceDrop={onDrop} animationDuration={50} />
    </div>
  );
};

export default ChessBoard;