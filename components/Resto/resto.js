import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './resto.css';

function Resto() {
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState('');
  const [validCountries, setValidCountries] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  

  useEffect(() => {
    // Récupérer la liste des pays depuis l'API
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countries = response.data.map(country => country.name.common);
        setValidCountries(countries);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleConditionsChange = (e) => {
    setConditions(e.target.value);
  };

  const handleRecommendationClick = () => {
    // Vérifiez ici si au moins un pays est saisi avant de procéder
    if (isLocationValid()) {
      // Effectuez l'appel API ou la logique de recommandation ici
      console.log('Location:', location);
      console.log('Conditions:', conditions);

      // Envoi des données au backend Flask
      axios.post('http://localhost:5000/resto', {
        location: location,
        conditions: conditions
      })
      .then(response => {
        console.log('Backend Response:', response.data);
        setRecommendations(response.data['resto recommendations']);
      

      })
      .catch(error => {
        console.error('Error sending data to backend:', error);
      });

    } else {
      alert('Veuillez saisir au moins un pays valide.');
    }
  };

  const isLocationValid = () => {
    // Vérifie si le champ pays est rempli et si la valeur est dans la liste des pays valides
    return location.trim() !== '' && validCountries.some(country => location.trim().toLowerCase().includes(country.toLowerCase()));
  };

  return (
    <div className="chatbot-interface">
      <div className='res'><h3>Your Location</h3></div>
      <div>
        <input
          className='restext'
          type="text"
          placeholder="Enter your location"
          value={location}
          onChange={handleLocationChange}
        />
        <div className='res2'><h3>Conditions</h3></div>
        <div>
          <input
            className='restext2'
            type="text"
            placeholder="Conditions"
            value={conditions}
            onChange={handleConditionsChange}
          />
          <div>
            <button className='btnres' onClick={handleRecommendationClick}>
              Recommandation By IA
            </button>
          </div>
          {recommendations && (
            <div className="recommendationsr">
              <h3>Recommendations:</h3>
              {recommendations.split('\n').map((restaurant, index) => (
                <p key={index}>
                  <h4>{restaurant.split(':')[0]}</h4>: {restaurant.split(': ')[1]}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Resto;

