import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Format de l\'email incorrect');
        return;
      }

      setEmailError('');
      setLoginError('');

      // Envoyer les informations au serveur Flask
      const response = await axios.post('http://localhost:5000/login', {
        email: email,
        password: password,
      });

      // Gérer la réponse du serveur (par exemple, rediriger l'utilisateur)
      console.log(response.data);

      // Redirection après la connexion réussie (ajoutez votre logique de redirection ici)
      window.location.href = `/principal/${email}`;
    } catch (error) {
      // Gérer les erreurs (par exemple, afficher un message d'erreur à l'utilisateur)
      console.error('Erreur lors de la connexion:', error);
      setLoginError('Email or password incorrect');
    }
  };

  return (
    <body>
      <div className="headerr">
        <div className="logoo">MyCalHabits</div>
      </div>

      <center>
        <div className="form-container">
          <center>
            <h2>LOG IN</h2>
          </center>
          <center>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {emailError && <div className="error-message">{emailError}</div>}
            {loginError && <div className="error-message">{loginError}</div>}
            <br />
          </center>

          <center>
            <a href="/forgot">Forgot Password?</a>
          </center>
          <center>
            <input type="submit" value="Log In" onClick={handleLogin} />
          </center>

          <div className="register">
            <p>
              Not a member yet? <a href="/signup">Sign Up!</a>
            </p>
          </div>
          <div className="image-login"></div>
        </div>
      </center>
    </body>
  );
}

export default Login;