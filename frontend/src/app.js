import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import axios from 'axios';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import './app.css';
import { fetchUserDetails, signOut} from './services/api';
Amplify.configure(config);

// Import the Framer Navigation component
import Navigation from './framer/navigation';
import Hero from './framer/hero';
import UserSurvey from './framer/userSurvey';

// Import pages
import UserPage from './pages/UserPage';
import UserForm from './pages/UserForm';
import ChooseJournalist from './pages/ChooseJournalist';
import ChooseJournalist2 from './pages/ChooseJournalist2';
import JournalistRatingPage from './pages/JournalistRatingPage';
import ComingSoon from './pages/ComingSoon';
import SignIn from './pages/SignIn';
import SignUp from './pages/Signup';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Call it on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

function App() {
  const size = useWindowSize();
  let variant;

  if (size.width < 600) {
    variant = 'Phone';
  } else if (size.width < 1024) {
    variant = 'Phone';
  } else {
    variant = 'Desktop';
  }

  // State to hold the list of games and user info
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch games from the backend and sort by popularity
  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/games/`);
      const sortedGames = response.data.sort((a, b) => b.clickCount - a.clickCount);  // Sort by clickCount
      setGames(sortedGames);  // Store the sorted games in state
      setFilteredGames(sortedGames); // Set the filteredGames initially to sorted games
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchAuthenticatedUser = async () => {
    try {
      const userDetails = await fetchUserDetails();
      setUser(userDetails);
    } catch (error) {
      console.error('Error fetching authenticated user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games on component mount and get current user info
  useEffect(() => {
    fetchAuthenticatedUser();
    fetchGames();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Function to handle the search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(query)
    );
    setFilteredGames(filtered);
  };

  // Function to clear the search input
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredGames(games);
  };

  // Function to handle game clicks and increment the click count
  const handleGameClick = (gameId) => {
    axios.post(`${API_URL}/increment-click/${gameId}/`)
      .then(response => {
        console.log("Click recorded successfully", response.data);
        fetchGames();  // Re-fetch the games to update the click count and re-sort the list
      })
      .catch(error => {
        console.error("Error recording click:", error);
      });
  };

  const handleSignOut = () => {
    signOut(); // Clear tokens and reset user state
    setUser(null);
    navigate('/signin'); // Redirect to sign-in page
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <Router>
    <div className="nav-container">
      {/* Responsive Navigation Component */}
      <Navigation 
        userName={user ? user.username : 'Guest'}
        className="!w-full"
        style={{ width: '100%' }}
        variant={variant}
      />

      <Routes>
        {/* Main page route */}
        <Route
          path="/"
          element={
            <>
              <Hero
                className="!w-full"
                style={{ width: '100%' }}
                variant={variant}
              />
              <UserSurvey
                className="!w-full"
                style={{ width: '100%' }}
                variant={variant}
              />

              {/* Add a section to display games */}
              <div className="game-list">
                <h2>Anticipated Future Games</h2>
                {/* Search Bar */}
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search for a game..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <button className="clear-search" onClick={clearSearch}>
                    Clear Search
                  </button>
                </div>
                
                {/* Conditionally render the game list or no games found message */}
                {filteredGames.length > 0 ? (
                  <ul>
                    {filteredGames
                      .sort((a, b) => b.click_count - a.click_count) // Sort by click_count in descending order
                      .map((game) => (
                        <li key={game.id} className="game-item">
                          <Link
                            to={`/chooseJournalist2/${encodeURIComponent(game.title)}`}
                            className="game-list"
                            onClick={() => handleGameClick(game.id)}
                          >
                            <span className="game-title">{game.title}</span>
                            <span className="game-rating">{game.averageRating}</span>
                          </Link>

                          {/* Combined Journalist Button to the right */}
                          <div className="journalist-buttons">
                            <ChooseJournalist gameTitle={game.title} />
                          </div>
                        </li>
                        
                      ))}
                  </ul>
                ) : (
                  searchQuery && <p style={{ fontSize: '1.2em' }}>No games found</p>
                )}
              </div>
            </>
          }
        />
        <Route path="/chooseJournalist2/:gameTitle" element={<ChooseJournalist2 />} />
        <Route path="/chooseJournalist/:gameTitle" element={<ChooseJournalist />} />
        <Route path="/comingSoon" element={<ComingSoon />} />
        <Route path="/userForm" element={<UserForm />} />
        <Route path="/rate/:journalist/:gameTitle" element={<JournalistRatingPage />} />
        <Route path="/signin" element={<SignIn setUser={setUser} />} />
        <Route path="/user" element={user ? <UserPage /> : <SignIn setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
