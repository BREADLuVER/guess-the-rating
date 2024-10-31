//guess-the-rating\frontend\src\pages\UserForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuggestions, addGame } from '../services/api';
import { getCurrentUser } from 'aws-amplify/auth';
import './UserForm.css';

const UserForm = () => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username } = await getCurrentUser();
        setUser(username);
        console.log('UserForm user:', username);
      } catch (error) {
        console.error("Error fetching user session:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);
  
  // Handle title input change
  const handleTitleChange = (e) => {
    const query = e.target.value;
    setTitle(query);

    if (query.length >= 2) {
      fetchSuggestions(query)
        .then(response => setSuggestions(response.data))
        .catch(error => console.error("Error fetching suggestions:", error));
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be signed in to add a game.");
      return;
    }

    const gameExists = suggestions.some(
      (suggestion) => suggestion.title.toLowerCase() === title.toLowerCase()
    );

    if (!gameExists) {
      alert("Game does not exist or already has a rating.");
      return;
    }

    try {
      await addGame(title, user); // Pass title and user
      setTitle('');
      navigate('/');
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
