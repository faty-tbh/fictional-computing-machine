import React from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import './acc.css';


function Acc() {
  return (
    
    <div className="Acc">
      <div className="headeracc">
        <div className="logoacc">MyCalHabits</div>
        {/* Use Link instead of onclick for navigation */}
        <Link to="/login" className="login-button">Login</Link>
      </div>
      <div className="container">
        <h1>GOOD HEALTH</h1>
        <p>A healthy life starts with good nutrition. Do you want to pay more attention to what you eat? Track your meals, learn more about your habits, and achieve your goals with MyCalHabits.</p>
        <center><button>Start For Free</button></center>
        <div className="image-right"></div>
      </div>
    </div>
  );
}

export default Acc;