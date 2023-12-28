// Ing.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ing.css';

const Ing = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleImageUpload = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  const handleCheckButtonClick = async () => {
    if (!image) {
      // Show alert if no image is uploaded
      window.alert('Please upload an image first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);

      // Send the image to the Flask server
      const response = await axios.post('http://localhost:5000/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the state with the analysis data
      setAnalysis(response.data);

      // Handle the server response as needed
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Trigger a re-render when the analysis state changes
  useEffect(() => {
    // This block will run every time the 'analysis' state changes
    console.log('Analysis state changed:', analysis);
  }, [analysis]);

  return (
    <div className="ingredients-container">
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={handleCheckButtonClick}>Check</button>

      {/* Display analysis results here */}
      {analysis && (
  <div className="analysis-results">
    <h3>Analysis Results:</h3>
    {/* Make sure that analysis.result is the correct path to the data you want to display */}
    <strong><p>{analysis.ImgAnalysis}</p></strong>
    
    {/* Add other analysis elements as needed */}
  </div>
)}
    </div>
  );
};

export default Ing;
