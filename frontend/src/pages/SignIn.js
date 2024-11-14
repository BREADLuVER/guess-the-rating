import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import './SignIn.css';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const { nextStep } = await signIn({ username, password });
      const signInStep = nextStep?.signInStep;

      if (signInStep === 'DONE') {
        navigate('/');
        window.location.reload();
      } else {
        console.log(`Handle the next step: ${signInStep}`);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage('Sign-in failed. Please check your credentials or complete the next step.');
    }
  };

  return (
    <div className="sign-in-page">
      <div className="sign-in-container">
        <h2>Sign In</h2>
        <p>Please enter your username and password to sign in.</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
