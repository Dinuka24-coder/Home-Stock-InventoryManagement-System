import React from 'react';
import "../styles/Avatar.css";

const Avatar = ({ isSpeaking, emotion = "neutral" }) => {
  return (
    <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''} emotion-${emotion}`}>
      <div className="avatar-face">
        <div className="avatar-eyes">
          <div className="avatar-eye left"></div>
          <div className="avatar-eye right"></div>
        </div>
        <div className={`avatar-mouth ${isSpeaking ? 'talking' : ''}`}></div>
        <div className="avatar-expression"></div>
      </div>
      
      {isSpeaking && (
        <div className="sound-waves">
          <div className="sound-wave"></div>
          <div className="sound-wave"></div>
          <div className="sound-wave"></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;