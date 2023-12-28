import React, { useEffect, useState } from 'react';
import { useLocation} from 'react-router-dom';
import './principal.css';
import axios from 'axios';
import Chatbot from '../Chatbot/chatbot';
import Resto from '../Resto/resto';
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker';
import Ing from '../Ing/ing'
import Edit from'../Edit/edit';




function Principal() {
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [MyIMC, setIMC] = useState("");
  const [remark, setIMCRemark] = useState("");
  const [, setAge] = useState(0);
  const [, setActivityLevel] = useState(1.2); // Exemple de niveau d'activité sédentaire
  const [weightGoal, setWeightGoal] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [targetDate, setTargetDate] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const handleGetRecommendationClick = () => {setShowRecommendation(true);};
  const [pdfAnalysis, setPdfAnalysis] = useState(null);
  // État pour stocker les messages et les réponses de l'utilisateur
  const [showRestaurantRecommendation, setShowRestaurantRecommendation] = useState(false);

  const handleFindRestaurantClick = () => {
    setShowRecommendation(false); // Hide other recommendations
    setShowRestaurantRecommendation(true); // Show restaurant recommendation
  };
  const [showIngredients, setShowIngredients] = useState(false);
  const handleIngredientsClick = () => {
    setShowIngredients(true);
  };
  const [editMode, setEditMode] = useState(false);

  const handleEditClick = () => {
    setEditMode(true);
  };
  
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  
  const handleBackClick = () => {
    // Rafraîchir la page
    window.location.reload();
  };

  const handlePDFAnalysisClick = () => {
    setShowPDFUpload(true);
  };
  const handlePDF = async () => {
    // Check if a file is selected for upload
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('Please upload a PDF or an image.');
      return;
    }
  
    const uploadedFile = fileInput.files[0];
  
    // Set the worker source path
    pdfjs.GlobalWorkerOptions.workerSrc = 'path-to-pdfjs-dist/build/pdf.worker.min.js';
  
    // Use pdfjs to parse and extract text from the PDF
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
  
      // Load PDF using pdfjs
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileContent) });
      const pdf = await loadingTask.promise;
  
      // Extract text from each page
      let pdfText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(' ');
        pdfText += `Page ${i}: ${text}\n`;
      }
  
      // Send the PDF text to the Flask backend
      try {
        const response = await axios.post('http://localhost:5000/pdf', {
          pdfText: pdfText,
          
        });
        setPdfAnalysis(response.data.pdfAnalysis)
  
       
        console.log(response.data);
      } catch (error) {
        console.error('Error sending PDF content to the server:', error);
      }
    };
  
    // Read the file content as ArrayBuffer
    reader.readAsArrayBuffer(uploadedFile);
  };
  const calculateTargetDate = (currentWeight, weightGoal, dailyCaloricIntake, dailyCaloricNeed) => {
    const caloriesPerKg = 7700;
    const totalCaloriesToLose = (currentWeight - weightGoal) * caloriesPerKg;
    const dailyCaloricDeficit = dailyCaloricNeed - dailyCaloricIntake;
    const daysToReachGoal = Math.abs(totalCaloriesToLose / dailyCaloricDeficit);
    const currentDate = new Date();
    const targetDate = new Date(currentDate.setDate(currentDate.getDate() + daysToReachGoal));
    return targetDate;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = location.pathname.split('/').pop();
        const response = await axios.post('http://localhost:5000/getUserData', {
          email: email,
        });
        console.log(response.data)

        if (response.data && typeof response.data === 'object') {
          if ('full_name' in response.data && 'weight' in response.data && 'height' in response.data && 'gender' in response.data) {
            setFullName(response.data.full_name);

            const heightMeters = parseFloat(response.data.height) / 100;
            const weightKg = parseFloat(response.data.weight);

            if (!isNaN(heightMeters) && !isNaN(weightKg) && heightMeters > 0 && weightKg > 0) {
              const bmi = weightKg / (heightMeters * heightMeters);
              setIMC(bmi.toFixed(2));
            
              let bmr;
              if (response.data.gender.toLowerCase() === 'male') {
                bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightMeters * 100) - (5.677 * response.data.age);
              } else {
                bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightMeters * 100) - (4.330 * response.data.age);
              }
            
              const maintenanceCalories = bmr * response.data.activity_level;
            
              const weightDifference = weightGoal - weightKg;
              const calorieAdjustment = weightDifference < 0 ? -500 : 500; 
              const targetCalories = maintenanceCalories + calorieAdjustment;
            
              setDailyCalories(targetCalories.toFixed(2));
            
              let bmiRemark = 'Your BMI is not in the healthy range.';
              if (response.data.gender.toLowerCase() === 'male' && bmi >= 18.5 && bmi <= 24.9) {
                bmiRemark = 'Your BMI is in the healthy range for a man.';
              } else if (response.data.gender.toLowerCase() === 'female' && bmi >= 18.5 && bmi <= 24.9) {
                bmiRemark = 'Your BMI is in the healthy range for a woman.';
              }
              setIMCRemark(bmiRemark);
            
              if ('age' in response.data && 'activity_level' in response.data && 'weight_goal' in response.data) {
                setAge(response.data.age);
                setActivityLevel(response.data.activity_level);
                setWeightGoal(response.data.weight_goal);
            
                const targetDate = calculateTargetDate(weightKg, weightGoal, targetCalories, maintenanceCalories);
                setTargetDate(targetDate);
              }
            
            } else {
              console.error('Hauteur ou poids non valides dans les données reçues.');
            }
          } else {
            console.error('Les propriétés nécessaires ne sont pas présentes dans les données reçues.');
          }
        } else {
          console.error('Les données reçues ne sont pas au format JSON ou sont vides.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des données:', error);
      }
    };

    fetchData();
  }, [location.pathname, weightGoal]);

  return (
    <div className="Acc">
      <div className="header">
        <div className="logo">MyCalHabits</div>
        <a className="logout-button" href="/login">Log Out!</a>
      </div>

      <div className="sidebar">
        <ul>
          <li>
            <h2>Hi {fullName}!<br /><br /><br /></h2>
          </li>
          <li>
            <h3>Your BMI</h3>
            <p className='bmi'>{MyIMC}</p>
            <p>{remark}</p>
          </li>
          <li>
          <button className="button-text" onClick={handlePDFAnalysisClick}>Analyse By IA</button>
          </li>
          {/* Add more items here if necessary */}
        </ul>
      </div>

      {!showRecommendation && !showPDFUpload && !showIngredients && !editMode && !pdfAnalysis ? (
        <div className='test'>
          
          <h2>Calories / Day (Target Date)</h2>
          <p className='cal'>{dailyCalories}</p>
          <p>{targetDate ? targetDate.toDateString() : "Calculating..."}</p>
          <button className='edit'onClick={handleEditClick}>Edit You Infos</button>
      
           
          <div className="buttons-container">
  <div className="custom-button" onClick={handleGetRecommendationClick}>
    {/* Icône et texte pour le premier bouton */}
    <div className="button-icon">
      {/**/}
      <p>💡</p>
    </div>
    <div className="button-text">Get Recommendation</div>
    <div className="button-count"></div>
  </div>

  <div className="custom-button" onClick={handleFindRestaurantClick}>
    {/* Icône et texte pour le second bouton */}
    <div className="button-icon">
      {/* */}
      <p>🍴</p>
    </div>
    <div className="button-text">Find a Restaurant</div>
    <div className="button-count"></div>
  </div>
  <div className="custom-button" onClick={handleIngredientsClick}>
    {/* Icône et texte pour le second bouton */}
    <div className="button-icon">
      {/* */}
      <p>🔎</p>
    </div>
    <div className="button-text">INGREDIENTS</div>
    <div className="button-count"></div>
  </div>
</div>
        </div>
      ) : null}

      {showRecommendation ? (
        // Chatbot interface 
        <center>
          <button className='showrec' onClick={handleBackClick}>Back</button>
          <h2 className='rech'><strong>Diet & Workout Recommandation </strong></h2>
          <h3 className='rech3'><strong>Based On Your answers </strong></h3>
          <div className="chatbot-interface">
            <Chatbot />
          </div>
        </center>
      ) : null}


      {editMode &&(
        <center>
          
        
        <Edit />
        <button className='bo' onClick={handleBackClick}>Back</button>
        
      </center>

      )
}

      {showPDFUpload &&  (
        <div className='pdf'>
          <button className='back' onClick={handleBackClick}>Back</button>
          
          <h2>Get Info from your PDF - Analyze Health</h2><br /><br /><br />
          <input className='upload' type="file" accept=".pdf, image/*" />
          <button className='start'onClick={handlePDF}>Start</button>
          {/**/}
          {pdfAnalysis && (
  <div className='pdf_result'>
    <h3>PDF Analysis Results:</h3>
    {/* Split the text into paragraphs using '\n' as separator */}
    {pdfAnalysis.split('\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ))}
  </div>
)}
        </div>
      )}

      {showRestaurantRecommendation && (
        <center>
          
          <h2 className='resto'><strong>Restaurant Recommendation</strong></h2>
          <Resto />
          <button className='showpp' onClick={handleBackClick}>Back</button>
          
        </center>
        
      )}

    {showIngredients ? (
      <center>
        <h2 className='rechh'><strong>Check Ingredients - Image</strong></h2>
        <Ing />
        <button className='showrec' onClick={handleBackClick}>Back</button>

      </center>
     
     
     ) : null}   
         
      
      
      
        
        
    </div>
  );
}

export default Principal;
