import React, { useState } from 'react';
import axios from 'axios';
import './chatbot.css';

function Chatbot() {
  const [userResponses, setUserResponses] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  
  // Simulate a set of questions and response options
  const questions = [
    { id: 1, text: "Are you allergic?", options: ["No, Not Allergic", "Yes, Allergic"] },
    { id: 2, text: "Do you have your main dietary preference?", options: ["No", "Yes"] },
    { id: 3, text: "Do you have any health problems that can affect your diet?", options: ["No health problem", "Yes, I have Health problems"] },
    { id: 4, text: "Do you have any dietary preferences, such as gluten-free or dairy-free?", options: ["No dietary preferences", "Yes, I have dietary preferences"] },
    { id: 5, text: "Do you engage in regular physical exercise?", options: ["No, I don't exercise regularly", "Yes, I exercise regularly"] },
  ];
  const initialAnswers = {};
  questions.forEach((question) => {
    initialAnswers[question.id] = { answer: question.options[0], additionalText: '' };
  });

  const [answers, setAnswers] = useState({});
  const [showTextBox, setShowTextBox] = useState(Array(questions.length).fill(false)); // Initial state for each question

  const handleDropdownChange = (questionId, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: { ...prevAnswers[questionId], answer: selectedOption }
    }));
  
    // Check if the selected option is "Yes" for the current question
    const showTextBox = selectedOption.includes("Yes");
    setShowTextBox((prevShowTextBox) =>
      prevShowTextBox.map((item, index) => (index === questionId - 1 ? showTextBox : item))
    );
  };
  
  const handleTextBoxChange = (questionId, text) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: { ...prevAnswers[questionId], additionalText: text }
    }));
  };
  
  const handleOptionClick = async () => {
    const newUserResponses = questions.map((question) => ({
      answer: answers[question.id]?.answer || '',
      additionalText: answers[question.id]?.additionalText || ''
    }));
  
    setUserResponses(newUserResponses);
   
  
    
      // All questions have been asked, send responses to the backend
      try {
        const response = await axios.post('http://localhost:5000/chat', { responses: newUserResponses });
        setRecommendation(response.data.Recs);
        console.log(response.data.Recs)
        

      } catch (error) {
        console.error('Error communicating with the backend:', error);
      }
   
      
    
  };

  return (
    <div className="chatbot-interface">
      {questions.map((question, index) => (
  <div key={question.id}>
    <h3 className='no'>{question.text}</h3>
    <br /><select
      value={answers[question.id]?.answer || ''}
      onChange={(e) => handleDropdownChange(question.id, e.target.value)}
    ><br />
      {question.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {showTextBox[question.id - 1] && (
      <input
        className='input'
        type="text"
        placeholder="Enter specific answer"
        value={answers[question.id]?.additionalText || ''}
        onChange={(e) => handleTextBoxChange(question.id, e.target.value)}
      />
    )}
  </div>
))}
     <br /><button onClick={handleOptionClick} className='btnrec'>Recommandation By IA</button>

      {/* Display the recommendations if they exist */}
      {recommendation && (
  <div className="recommendations">
   
    {recommendation.split('\n').map((item, index) => {
      const trimmedItem = item.trim();
      if (trimmedItem) {
        const isTitle = trimmedItem.endsWith(':');
        const content = isTitle ? <strong><h3 className='title'>{trimmedItem}</h3></strong> : trimmedItem;
        return (
          <p key={index}>
            {content}
          </p>
        );
      } else {
        return null; // Skip empty lines
      }
    })}
  </div>
)}


      
    </div>
  );
}

export default Chatbot;