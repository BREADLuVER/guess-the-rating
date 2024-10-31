import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut, updatePassword } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import './UserPage.css';

const UserPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth events to update user state
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          fetchUser();
          break;
        case 'signOut':
          setUser(null);
          localStorage.removeItem('authToken');
          window.location.reload();
          break;
        case 'tokenRefresh':
          console.log('Auth tokens have been refreshed.');
          fetchToken(); // Refresh and store the new token
          break;
        case 'tokenRefresh_failure':
          console.error('Failure while refreshing auth tokens.');
          break;
        default:
          break;
      }
    });

    // Initial fetch of user data and token
    fetchUser();

    // Cleanup Hub listener
    return () => unsubscribe();
  }, []);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      fetchToken();
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrorMessage('Error fetching user session.');
    }
  };

  const fetchToken = async () => {
    try {
      const { accessToken } = (await fetchAuthSession()).tokens ?? {};
      if (accessToken) {
        localStorage.setItem('authToken', accessToken);
        console.log('User session token:', accessToken);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Handle sign out and clear token from storage
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      localStorage.removeItem('authToken');
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      await updatePassword(user, oldPassword, newPassword);
      setSuccessMessage('Password changed successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage('Error changing password. Please ensure the old password is correct.');
      setSuccessMessage('');
    }
  };

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
