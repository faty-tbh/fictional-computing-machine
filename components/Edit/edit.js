import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation} from 'react-router-dom';
import styles from './edit.css';
import axios from 'axios';

const Edit = () => {
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
  const [emailExistsError, setEmailExistsError] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const location = useLocation();
  const [submitStatus, setSubmitStatus] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and set the state for editing
    const fetchUserData = async () => {
      try {
        const email = location.pathname.split('/').pop();
        // Assuming you have the user's email available, replace 'currentUserEmail' with the actual variable containing the email
        const response = await axios.post('http://localhost:5000/getUserData', { email: email });
        const userData = response.data;

        // Set the state with the user data for editing
        setEmail(userData.email);
        setPassword(userData.password); // Add other fields as needed
        setName(userData.full_name);
        setAge(userData.age);
        setGender(userData.gender);
        setHeight(userData.height);
        setWeight(userData.weight);
        setGoal(userData.goal);
        setWeightGoal(userData.weightGoal);
        setActivityLevel(userData.activityLevel);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    // Perform validation and submission logic for updating user information
    try {
        // Assuming you want to update the user's information using a POST request
        const response = await axios.post('http://localhost:5000/updateUserInfo', {
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
  
        console.log('Response:', response.data);
        setSubmitStatus(response.data.message );
  
        
      } catch (error) {
        console.error('Error updating user information:', error);
        setSubmitError(error.message);
      } finally {
        setSubmitting(false);
      }
    };
  
    return (
        <div className={styles.container}>
        
  
        <form className='MyFormm' onSubmit={handleSubmit}>
          <h2>EDIT</h2>
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
          <input type="submit" value="Edit" disabled={submitting} /><br/>
          <strong>{submitStatus}</strong>
          
          </center>
        </form>
        
      </div>
      
   );
  };
  
  export default Edit;