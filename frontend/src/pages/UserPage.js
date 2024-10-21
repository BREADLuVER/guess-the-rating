import React, { useState, useEffect } from 'react';
import { signOut, getCurrentUser, updatePassword } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';

const UserPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user); // Set the current user
      } catch (error) {
        setErrorMessage('Error fetching user');
      }
    };

    fetchUser();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
      window.location.reload(); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle the change password
  const handleChangePassword = async () => {
    try {
      const user = await getCurrentUser(); // Get the current authenticated user
      await updatePassword(user, oldPassword, newPassword); // Update password using Amplify v6 API
      setSuccessMessage('Password changed successfully!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error changing password. Please ensure the old password is correct.');
      setSuccessMessage('');
    }
  };

  // Render Sign-In form if the user is "Guest"
  if (user && user.username === 'Guest') {
    return (
      <div className="user-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Welcome Guest!</h2>
          <p>Please sign in to access your account.</p>
          {/* Sign-in form placeholder */}
          <button onClick={() => navigate('/signin')} style={{ padding: '10px 20px', marginTop: '10px' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Render Change Password page if the user is not "Guest"
  return (
    <div className="user-page">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>User Settings</h2>

        {/* Change Password Form */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ margin: '5px', padding: '8px', width: '200px' }}
          />
          <br />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ margin: '5px', padding: '8px', width: '200px' }}
          />
          <br />
          <button onClick={handleChangePassword} style={{ padding: '10px 20px', marginTop: '10px' }}>
            Change Password
          </button>
        </div>

        {/* Logout Button */}
        <div>
          <button onClick={handleSignOut} style={{ padding: '10px 20px', marginTop: '10px' }}>
            Log Out
          </button>
        </div>

        {/* Success and Error Messages */}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default UserPage;
