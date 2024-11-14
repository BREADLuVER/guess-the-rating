import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Signup.css';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const response = await registerUser(username, email, password);

      if (response.status === 201) {
        setSuccessMessage('Account created successfully! Please sign in.');
        navigate('/signin');
      } else {
        setErrorMessage('Sign-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage(error.response?.data?.error || 'Sign-up failed. Please try again.');
    }
  };

  return (
    <div className="sign-up-page">
      <div className="sign-up-container">
        <h2>Sign Up</h2>
        <p>Create an account by filling in the details below.</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSignUp} className="sign-up-button">
          Sign Up
        </button>
        <p>
          Already have an account?{' '}
          <Link to="/signin" className="signin-link">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
