import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import './JournalistRatingPage.css';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import RatingBadge from './RatingBadge';

Chart.register(...registerables);

const JournalistRatingPage = () => {
  const [user, setUser] = useState(null);
  const { journalist, gameTitle } = useParams();
  const [selectedRating, setSelectedRating] = useState(null);
  const [message, setMessage] = useState('');
  const [ratingData, setRatingData] = useState(null);
  const [userSubmittedRating, setUserSubmittedRating] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setMessage('Please sign in to submit your rating.');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.username);
        fetchRatingData(response.data.username);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setMessage('Please sign in to submit your rating.');
      }
    };

    fetchUserData();
  }, [API_URL]);

  const submitRating = async (rating) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('You must be signed in to rate a game.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/predictions/`,
        {
          user,
          game: gameTitle,
          journalist,
          predicted_rating: rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        setMessage(`You have predicted ${journalist} will rate ${gameTitle} a ${rating}/10!`);
        setUserSubmittedRating(true);
        setUserRating(rating);
        fetchRatingData(user);
      } else {
        setMessage('Failed to submit rating.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('An error occurred while submitting your rating.');
    }
  };

  const fetchRatingData = async (username) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('Please sign in to view ratings.');
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/predictions/${gameTitle}/${journalist}/?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const fetchedData = response.data;
      const ratingsArray = fetchedData.ratings || [];
      const mappedData = mapDataToGraph(ratingsArray);
      setRatingData(mappedData);

      const userSubmitted = fetchedData.userRating;
      setUserSubmittedRating(!!userSubmitted);
      setUserRating(userSubmitted || null);
    } catch (error) {
      console.error('Error fetching ratings data:', error);
    }
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    submitRating(rating);
  };

  const mapDataToGraph = (data) => {
    const ratingsArray = Array(10).fill(0);
    data.forEach((item) => {
      const ratingIndex = item.predicted_rating - 1;
      if (ratingIndex >= 0 && ratingIndex < 10) {
        ratingsArray[ratingIndex] += item.count;
      }
    });
    return ratingsArray;
  };

  const graphData = ratingData && {
    labels: [...Array(10).keys()].map((i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Ratings Distribution',
        data: ratingData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="rating-page-container">
      <div className="rating-content">
        {message && <h1>{message}</h1>}
        {ratingData && (
          <div className="bar-chart">
            <Bar
              data={graphData}
              options={{ scales: { y: { beginAtZero: true } } }}
            />
          </div>
        )}
        {user ? (
          userSubmittedRating ? (
            <div className="resubmit-section">
              <h2>You have already submitted a rating of {userRating}/10. Would you like to update your rating?</h2>
              <RatingBadge
                initialRating={userRating || selectedRating}
                onRatingChange={handleRatingChange}
              />
            </div>
          ) : (
            <div className="rating-select-container">
              <h2>Select your rating for {journalist}'s review of {decodeURIComponent(gameTitle)}</h2>
              <RatingBadge
                initialRating={selectedRating}
                onRatingChange={handleRatingChange}
              />
            </div>
          )
        ) : (
          <h2>Please sign in to submit your rating for {journalist} on {decodeURIComponent(gameTitle)}.</h2>
        )}
      </div>
    </div>
  );
};

export default JournalistRatingPage;
