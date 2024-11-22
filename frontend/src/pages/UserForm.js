import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuggestions, addGame, fetchUserDetails} from '../services/api';
import './UserForm.css';

const UserForm = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the authenticated user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await fetchUserDetails();
        setUser(userDetails.username);
        console.log('UserForm user:', userDetails.username);
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Handle title changes and fetch suggestions
  const handleTitleChange = (e) => {
    const query = e.target.value;
    setTitle(query);
    setError(''); // Clear previous errors

    if (query.length >= 2) {
      fetchSuggestions(query)
        .then((response) => {
          console.log("API response:", response.data); // Debug API data
          const data = Array.isArray(response.data) ? response.data : [];
          setSuggestions(data);
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]); // Reset suggestions on error
        });
    } else {
      setSuggestions([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be signed in to add a game.");
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await addGame(title, user, token); // Pass title, user, and token
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
