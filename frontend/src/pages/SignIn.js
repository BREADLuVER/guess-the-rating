import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; // Your CSS file

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      // Call the signIn method with username and password
      const { nextStep } = await signIn({
        username,
        password
      });

      // Check the signInStep from nextStep
      const signInStep = nextStep?.signInStep;

      console.log('Next step:', signInStep);

      // Handle different signInStep values
      if (signInStep === 'DONE') {
        // Sign-in is complete, navigate to the user page
        navigate('/');
        window.location.reload(); 
      } else if (signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
        // Handle SMS code confirmation if required
        console.log('Please enter the SMS code.');
      } else if (signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Handle new password confirmation if required
        console.log('User must set a new password.');
      } else {
        // Handle other potential next steps
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
      </div>
    </div>
  );
};

export default SignIn;
