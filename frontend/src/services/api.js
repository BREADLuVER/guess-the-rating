// frontend/src/services/api.js

import axios from 'axios';

const getAuthToken = () => localStorage.getItem('authToken');

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request:', config.url, 'Authorization:', config.headers.Authorization);
  } else {
    console.log('No token found.');
  }
  return config;
});

const API_URL = process.env.REACT_APP_BACKEND_URL;
console.log("API_URL:", API_URL);

export const fetchGames = () => axios.get(`${API_URL}/games/`);

export const fetchGameDetails = (gameId) => axios.get(`${API_URL}/games/${gameId}/`);

export const submitPrediction = (data) => axios.post(`${API_URL}/predictions/`, data);

export const fetchComments = (gameId) => axios.get(`${API_URL}/games/${gameId}/comments/`);

export const submitComment = (gameId, data) => axios.post(`${API_URL}/games/${gameId}/comments/new/`, data);

export const fetchSuggestions = (query) => axios.get(`${API_URL}/search-games/`, {
    params: { query },
  });

export const addGame = async (title, user, token) => {
  const response = await axios.post(
    `${API_URL}/api/games/`,
    { title, user },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export const registerUser = (username, email, password) => axios.post(`${API_URL}/register/`, {
  username,
  email,
  password,
});

export const signIn = (identifier, password) => {
  console.log('Sending sign-in request:', { identifier, password });
  return axios.post(`${API_URL}/login/`, {
    identifier, // Send as a root-level field
    password,   // Send as a root-level field
  });
};

export const fetchUserDetails = async (token) => {
  const response = await axios.get(`${API_URL}/api/user/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updatePassword = async (oldPassword, newPassword, token) => {
  const response = await axios.put(
    `${API_URL}/api/user/password/`,
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};