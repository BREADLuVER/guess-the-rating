import React, { useState } from 'react'; 
import { signIn } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './SignIn.css';

const SignIn = ({setUser}) => {
  const [identifier, setIdentifier] = useState(''); // Unified field for username/email
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    console.log('Attempting sign-in with:', { identifier, password });
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      const response = await signIn(identifier, password);

      const { access_token, refresh_token, user_id, username } = response.data;

      console.log('Sign-in successful:', response.data);

      // Store tokens
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Set user state
      setUser({ id: user_id, username });

      // Navigate to user page
      navigate('/user');
    } catch (error) {
      console.error('Sign-in error:', error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.error || 'Sign-in failed. Please check your credentials.'
      );
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
      </div>
    </div>
  );
};

export default SignIn;
