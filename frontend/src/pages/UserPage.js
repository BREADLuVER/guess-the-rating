import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserDetails, updatePassword } from '../services/api';
import './UserPage.css';

const UserPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please sign in again.');
        }

        const userDetails = await fetchUserDetails(token);
        setUser(userDetails);
        console.log('User fetched successfully:', userDetails);
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrorMessage('Failed to fetch user details. Please log in again.');
        setUser(null);
        localStorage.removeItem('authToken');
        navigate('/signin'); // Redirect to login
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle password change
  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }

      await updatePassword(oldPassword, newPassword, token);
      setSuccessMessage('Password changed successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorDetail = error.response?.data?.error || 'Failed to change password.';
      setErrorMessage(errorDetail);
      setSuccessMessage('');
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('authToken'); // Clear token
    setUser(null);
    navigate('/signin'); // Redirect to login
    window.location.reload(); // Reload the page to clear state
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user && user.username === 'Guest') {
    return (
      <div className="user-page">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Welcome Guest!</h2>
          <p>Please sign in to access your account.</p>
          <button onClick={() => signInWithRedirect({ provider: 'Google' })} style={{ padding: '10px 20px', marginTop: '10px' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Render Change Password and Sign Out options if user is signed in
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
