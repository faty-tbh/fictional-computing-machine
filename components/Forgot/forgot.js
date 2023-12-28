import React, { useState } from 'react';
import './forgot.css';

function Forgot() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
        // You can redirect or perform other actions based on the response
      } else {
        console.error('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <body>
      <div className="header">
        <div className="logo">MyCalHabits</div>
      </div>

      <div className="container">
        <form className="myForm" onSubmit={handleSubmit}>
          <h2>GET YOUR NEW PASSWORD</h2>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Verify</button>
          <p>
            Don't have an account? <a href="/signup">Sign Up!</a>
          </p>
        </form>
      </div>
    </body>
  );
}

export default Forgot;