import React, { useState } from 'react';
import '../../assets/Styles/AfterLogin/chatbox.css';
import ChatComponent from './ChatComponent';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-box-container">
      {isOpen && (
        <div className="chat-box">
         <ChatComponent />
        </div>
      )}
      <div className={`chat-box-button ${isOpen ? 'open' : ''}`} onClick={toggleChatBox}>
        <i className="fas fa-comments"></i>
      </div>
    </div>
  );
};

export default ChatBox;
