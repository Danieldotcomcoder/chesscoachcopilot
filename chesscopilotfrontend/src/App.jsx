import './App.css';
import Chat from './components/chat';
import ChessBoard from './components/chessboard';
import React, { useEffect, useState } from 'react';

function App() {
  const [chatData, setChatData] = useState(`{
  "name": "Queen's Gambit Declined",
  "moves": "d4 d5 c4 e6"
},
  {
  "name": "Queen's Gambit Opening",
  "moves": "d4 d5 c4"
}`);

  const [openings, setOpenings] = useState([]);
  const [mainPosition, setMainPosition] = useState({ name: '', moves: '' });

  const handleChatUpdate = (data) => {
    setTimeout(() => {
      setChatData(data);
    }, 200);
  };

  useEffect(() => {
    if (chatData) {

      const formattedData = `[${chatData}]`;

      try {
        const parsedData = JSON.parse(formattedData);
        setOpenings(parsedData);


        if (parsedData.length > 0) {
          setMainPosition(parsedData[0]);
        }
      } catch (error) {
        console.error('Failed to parse chat data', error);
      }
    }
  }, [chatData]);

  return (
    <main className='main'>
      <Chat onUpdate={handleChatUpdate} />
      <div className='full-board'>
        Chess Copilot Loaded Positions:
        <div className='loaded-positions'>
          {openings.map((position, index) => (
            <button className='position' key={index} onClick={() => setMainPosition(position)}>
              {position.name}
            </button>
          ))}

        </div>

        {mainPosition.moves !== '' ? (
          <ChessBoard moves={mainPosition.moves} name={mainPosition.name} />
        ) : (
          <ChessBoard moves="e4 e5" name={'test'} />
        )}
      </div>
    </main>
  );
}

export default App;