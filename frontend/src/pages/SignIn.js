import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';

const SignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = async (username, password) => {
    try {
      await signIn(username, password);
      navigate('/user'); // Redirect to user page after successful sign-in
    } catch (error) {
      console.error('Error signing in', error);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {/* Sign-in form here */}
      <button onClick={() => handleSignIn('username', 'password')}>
        Sign In
      </button>
    </div>
  );
};

export default SignIn;
