import React, { useState } from 'react';
import { signIn } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SignIn.css';

const SignIn = ({ setUser }) => {
  const [identifier, setIdentifier] = useState(''); // Unified field for username/email
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState(''); // Email for forgot password
  const [emailSent, setEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Modal toggle
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const handleSignIn = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      const response = await signIn(identifier, password);
      const { access_token, refresh_token, user_id, username } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('Invalid response from server: Missing tokens');
      }

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setUser({ id: user_id, username });
      navigate('/user');
      window.location.reload();
    } catch (error) {
      console.error('Sign-in error:', error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.error || 'Sign-in failed. Please check your credentials.'
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/password-reset/`, { email });
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setErrorMessage('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="sign-in-page">
      <div className="sign-in-container">
        <h2>Sign In</h2>
        <p>Please enter your username or email and password to sign in.</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSignIn} className="sign-in-button">
          Sign In
        </button>
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">
            Sign up now
          </Link>
        </p>
        <p>
          <a
            href="#"
            onClick={() => setShowForgotPassword(true)}
            className="forgot-password-link"
          >
            Forgot Password?
          </a>
        </p>
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
    </div>
  );
};

export default SignIn;
