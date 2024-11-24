import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserDetails, updatePassword } from '../services/api';
import axios from 'axios';
import './UserPage.css';

const UserPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please sign in again.');
        }
        const userDetails = await fetchUserDetails(token);
        setUser(userDetails);
      } catch (error) {
        setErrorMessage('Failed to fetch user details. Please log in again.');
        setUser(null);
        localStorage.removeItem('authToken');
        navigate('/signin');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }
      await updatePassword(oldPassword, newPassword, token);
      setSuccessMessage('Password changed successfully!');
    } catch (error) {
      setErrorMessage('Failed to change password.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/password-reset/`, { email });
      setEmailSent(true);
    } catch (error) {
      setErrorMessage('Failed to send password reset email. Please try again.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/signin');
    window.location.reload();
  };

  return (
    <div className="user-page">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>User Settings</h2>
        <div style={{ marginBottom: '20px' }}>
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword}>Change Password</button>
        </div>
        <div>
          <button onClick={handleSignOut}>Log Out</button>
        </div>

        {showForgotPassword && (
          <div className="forgot-password-modal">
            <h3>Forgot Password</h3>
            {emailSent ? (
              <p>A password reset link has been sent to your email.</p>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Send Reset Link</button>
              </form>
            )}
            <button
              onClick={() => setShowForgotPassword(false)}
              className="close-modal-button"
            >
              Close
            </button>
          </div>
        )}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default UserPage;
