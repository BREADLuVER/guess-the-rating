// frontend/src/services/api.js

import axios from 'axios';

const getAuthToken = () => localStorage.getItem('authToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    const publicEndpoints = ['/api/games/', '/api/search-games/'];
    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url.includes(endpoint));

    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        isPublicEndpoint
          ? `Public API Request: ${config.url}`
          : `API Request with token: ${config.url}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const API_URL = process.env.REACT_APP_BACKEND_URL;
console.log("API_URL:", API_URL);

export const fetchGames = async () => {
  const response = await axios.get(`${API_URL}/api/games/`);
  return response.data;
};

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

// Save the new tokens to localStorage
const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('authToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

// Remove tokens (for logout)
const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

// Refresh token logic
const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token found.');

    const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
    const { access } = response.data;
    saveTokens(access, refreshToken); // Save the new access token
    return access;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearTokens();
    throw error;
  }
};


// Axios interceptor to handle token expiry
axios.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAuthToken();
        if (!newAccessToken) throw new Error('Failed to refresh token');
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        clearTokens(); // Ensure tokens are cleared
        window.location.href = '/signin'; // Redirect to sign-in page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // Pass through other errors
  }
);

// Export API functions
export const fetchUserDetails = async () => {
  const response = await axios.get(`${API_URL}/user/`);
  return response.data;
};

export const signIn = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { identifier, password });
    console.log('Sign-in response data:', response.data); // Log the data returned by the API
    return response; // Ensure this returns the full Axios response
  } catch (error) {
    console.error('Sign-in API error:', error.response?.data || error.message);
    throw error; // Forward the error for proper handling in the caller
  }
};

export const signOut = () => {
  clearTokens();
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