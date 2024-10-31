// frontend/src/services/api.js

import axios from 'axios';

const getAuthToken = () => localStorage.getItem('authToken');

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

export const addGame = (title, username) => axios.post(`${API_URL}/api/add-game/`, { title, username });