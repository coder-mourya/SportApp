import React from 'react';
import '../../../assets/Styles/AfterLogin/chatbox.css';
import { useNavigate } from 'react-router-dom';

const ChatBox = ({ eventId }) => {
  const Navigate = useNavigate();


  const toggleChatBox = () => {
     Navigate('/chatScreen', { state: { eventId } });
  };

  return (
    <div className="chat-box-container">
      
      <div className={`chat-box-button `} onClick={toggleChatBox}>
        <i className="fas fa-comments"></i>
      </div>
    </div>
  );
};

export default ChatBox;
