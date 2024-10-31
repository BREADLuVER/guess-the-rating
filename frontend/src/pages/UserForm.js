//guess-the-rating\frontend\src\pages\UserForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuggestions } from '../services/api';
import axios from 'axios';
import './UserForm.css';

const UserForm = () => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

// Handle the title input change
const handleTitleChange = (e) => {
  const query = e.target.value;
  setTitle(query);

  if (query.length >= 2) {
    console.log(`Fetching suggestions for query: ${query}`);
    fetchSuggestions(query)
      .then(response => {
        console.log("Suggestions received:", response.data);
        setSuggestions(response.data);
      })
      .catch(error => {
        console.error("Error fetching suggestions:", error);
      });
  } else {
      setSuggestions([]);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if the game title exists in suggestions
  const gameExists = suggestions.some(suggestion => suggestion.title.toLowerCase() === title.toLowerCase());
  if (!gameExists) {
    alert("Game does not exist or already has a rating.");
    return;
  }

  try {
    // Send the new game data to the backend
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/add-game/`, { title });

    setTitle('');
    navigate('/');  // Navigate to the desired page after adding
    window.location.reload();
  } catch (error) {
    console.error('Error adding the game:', error);
  }
};

  return (
    <div className="user-form">
      <h2>Add a New Future Game</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Game Title:</label>
          <div className="input-with-button">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
            />
            <button type="submit">Submit</button>
          </div>
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => setTitle(suggestion.title)}>
                  {suggestion.title} ({suggestion.score})
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
