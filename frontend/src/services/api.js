// frontend/src/services/api.js

import axios from 'axios';

const getAuthToken = () => localStorage.getItem('authToken');

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Ensure `Bearer ` prefix is added
    console.log("Authorization header:", config.headers.Authorization); // Log to verify
  } else {
    console.log("No token found in localStorage.");
  }
  return config;
});

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchGames = () => axios.get(`${API_URL}/games/`);

export const fetchGameDetails = (gameId) => axios.get(`${API_URL}/games/${gameId}/`);

export const submitPrediction = (data) => axios.post(`${API_URL}/predictions/`, data);

export const fetchComments = (gameId) => axios.get(`${API_URL}/games/${gameId}/comments/`);

export const submitComment = (gameId, data) => axios.post(`${API_URL}/games/${gameId}/comments/new/`, data);

export const fetchSuggestions = (query) => axios.get(`${API_URL}/search-games/`, {
    params: { query },
  });

export const addGame = (title, user) => axios.post(`${API_URL}/api/add-game/`, {
  title,
  username: user
});

export const registerUser = (username, email, password) => axios.post(`${API_URL}/register/`, {
  username,
  email,
  password,
});