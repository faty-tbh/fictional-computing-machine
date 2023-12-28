import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './signup.css';
// import classNames from 'classnames';
import axios from 'axios';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [weightGoal, setWeightGoal] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [emailExistsError, setEmailExistsError] = useState('')
  const [activityLevel, setActivityLevel] = useState('');

  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Afficher un message d'erreur si le format de l'email est incorrect
      setEmailError('Format de l\'email incorrect');
      setSubmitting(false);
      return;
    }
    try {
      
      const response = await axios.post('http://localhost:5000/signup', {
        email,
        password,
        full_name,
        age,
        gender,
        height,
        weight,
        goal,
        weightGoal,
        activityLevel,
      });
      if (goal === 'lose-weight' && Number(weightGoal) >= Number(weight)) {
        setSubmitError('If you chose to lose weight, the goal weight must be less than your current weight.');
        setSubmitting(false);
        return;
      }
      if (goal === 'gain-weight' && Number(weightGoal) <= Number(weight)) {
        setSubmitError('If you chose to gain weight, the goal weight must be greater than your current weight.');
        setSubmitting(false);
        return;
      }
      
      
      console.log('Response:', response.data);
      // Redirect the user to the login page
      navigate('/login');
      
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.status === 400) {
        // Si le serveur renvoie une erreur 400 (Bad Request), c'est probablement parce que l'e-mail existe déjà
        setEmailExistsError('User with this email already exists. Please login.');
      } else {
        // Sinon, c'est une autre erreur, la traiter comme avant
        setSubmitError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className="headers">
        <div className="logos">MyCalHabits</div>
      </div>

      <form className='MyForm' onSubmit={handleSubmit}>
        <h2>SIGN UP</h2>
        <center><input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Effacer l'erreur d'email si elle était précédemment affichée
            setEmailError('');
          }}
          />
        {emailError && <p className="error">{emailError}</p>}
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="Full Name" required value={full_name} onChange={(e) => setName(e.target.value)} />
        <select name="gender" className={styles.gender} required value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="number" placeholder="Height (cm)" min="50" max="230" required value={height} onChange={(e) => setHeight(e.target.value)} />
        <input type="number" placeholder="Weight (kg)" min="20" max="300" required value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input type="number" placeholder="Age" min="5" max="100" required value={age} onChange={(e) => setAge(e.target.value)} />
        <select
          name="goal"
          className={styles.goal} required value={goal} onChange={(e) => setGoal(e.target.value)}
        >
          <option value="" disabled>Select Goal</option>
          <option value="gain-weight">Gain weight</option>
          <option value="lose-weight">Lose weight</option>
          <option value="maintain-weight">Maintain weight</option>
        </select>
        
        {goal === 'lose-weight' || goal === 'gain-weight' ? (
          <input
            type="number"
            placeholder="Weight Goal (kg)"
            min="20"
            max="300"
            required
            value={weightGoal}
            onChange={(e) => setWeightGoal(e.target.value)}
          />
        ) : null}
        <label htmlFor="activityLevel"></label>
      <select
        id="activityLevel"
        value={activityLevel}
        onChange={(e) => setActivityLevel(e.target.value)}
        required
      >
        <option value="">Select your activity level</option>
        <option value="1.2">Sedentary (little or no exercise)</option>
        <option value="1.375">Lightly active (light exercise/sports 1 to 3 days per week)</option>
        <option value="1.55">Moderately active (moderate exercise/sports 3 to 5 days per week)</option>
       <option value="1.725">Very active (hard exercise/sports 6 to 7 days per week)</option>
       <option value="1.9">Extremely active (very hard physical work or intense exercise twice a day)</option>

      </select>
        {emailExistsError && <p className="error">{emailExistsError}</p>}
        {submitError && <p className="error">Error: {submitError}</p>}
        <input type="submit" value="Sign Up" disabled={submitting} />
        <p>Already a member? <a href="/login">LOG IN</a></p>
        </center>
      </form>
      <div className="image-signup"></div>
    </div>
    
 );
};

export default SignUp;