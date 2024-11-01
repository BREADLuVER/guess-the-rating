import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuggestions, addGame } from '../services/api';
import { getCurrentUser } from 'aws-amplify/auth';
import './UserForm.css';

const UserForm = () => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(''); // State for error message
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

  const handleTitleChange = (e) => {
    const query = e.target.value;
    setTitle(query);
    setError('');  // Clear previous errors

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
  
    try {
      await addGame(title, user); // Pass title and user
      setTitle('');
      setError(''); // Clear any previous error
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error adding the game:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while adding the game.';
      setError(errorMessage); // Set error message in state
      console.log("Setting error message:", errorMessage); // Log for debugging
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
          {/* Display error message */}
          {error && <p className="error-message">{error}</p>}
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
