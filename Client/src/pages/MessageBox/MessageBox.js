import React from 'react';
import "./MessageBox.css";

function MessageBox(props) {
  return (
    <div className={`message-box ${props.position}`}>
      <img src={props.profilePicture} alt={props.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#ffcebe', borderRadius: '10px', maxWidth: '950%', textAlign:'left' }}>
      <strong  style={{}}>{props.name}</strong>
        <p style={{ margin: 0 }}>{props.message}</p>
        <span 
        style={{ fontSize: '12px', color: '#ff5421' }}>{props.time} --{props.date}
        </span>
       
        
      </div>
    </div>
  );
}

export default MessageBox;