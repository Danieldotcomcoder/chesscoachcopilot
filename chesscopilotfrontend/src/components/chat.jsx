
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import './chat.css';

const Chat = ({ onUpdate }) => {
  const [conversation, setConversation] = useState([{ role: 'system', message: 'Welcome to our chess service!' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || generateSessionId());
  let baseUrl = 'https://chesscopilotcontainerapp.delightfulflower-94769cbf.westus2.azurecontainerapps.io';
  // let baseUrl = 'http://localhost:80';
  const predefinedQuestions = [
    "Tell me about the queens gambit opening?",
    "Explain the rules of chess",
    "Tell me about a chess opening trap",
  ];

  function generateSessionId() {
    const newSessionId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', newSessionId);
    return newSessionId;
  }

  const sendQuestion = (questionText = input) => {
    setInput('');
    setIsLoading(true);
    axios.post(`${baseUrl}/chat`,
      { textParam: questionText, sessionId },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(res => {
        console.log(res.data);
        setConversation(res.data.conversation);
        onUpdate(res.data.chessmoves);

      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const startNewConversation = () => {
    const newSessionId = generateSessionId();
    setInput('');
    setIsLoading(true);
    axios.post(`${baseUrl}/start-conversation`, { sessionId: newSessionId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log(res.data);
        setConversation(res.data.conversation);
        
        setSessionId(newSessionId);
        localStorage.setItem('sessionId', newSessionId);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

 
  useEffect(() => {
    if (sessionId) {
      console.log(sessionId)
      axios.get(`${baseUrl}/conversation?sessionId=${sessionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.data.status === 'success') {
            setConversation(res.data.conversation);
            onUpdate(res.data.chessmoves);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [sessionId]);

  return (
    <div className="chat-container">
      <button className="new-conversation-btn" onClick={startNewConversation} disabled={isLoading}>New Conversation</button>
      {isLoading && <div className="message system-message"><CircularProgress color="secondary" /></div>}
      <div className="predefined-questions">
        {predefinedQuestions.map((question, index) => (
          <button className="question-btn" key={index} onClick={() => sendQuestion(question)} disabled={isLoading}>
            {question}
          </button>
        ))}
      </div>
      <div className="message-container">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.role}-message`}>
            <p>{message.message}</p>
          </div>
        ))}
        {isLoading && <div className="message system-message"><CircularProgress color="secondary" /></div>}
      </div>
      <div className="input-section">
        <input className="input-field" type="text" value={input} onChange={e => setInput(e.target.value)} />
        <button className="send-btn" onClick={() => sendQuestion(input)} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
