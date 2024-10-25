import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import './JournalistRatingPage.css';
import { getCurrentUser } from 'aws-amplify/auth';
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username } = await getCurrentUser();
        setUser(username);
        fetchRatingData(); // Fetch data for the user
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const submitRating = async (rating) => {
    if (!user) {
      setMessage("You must be signed in to rate a game.");
      return;
    }
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/predictions/',
        {
          user,
          game: gameTitle,
          journalist,
          predicted_rating: rating,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
  
      if (response.status === 201) {
        setMessage(`You have predicted ${journalist} will rate ${gameTitle} a ${rating}/10!`);
        setUserSubmittedRating(true); // Update submission status
        setUserRating(rating); // Store user rating
        await fetchRatingData(); // Ensure fetchRatingData is called
      } else {
        setMessage('Failed to submit rating.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('An error occurred while submitting your rating.');
    }
  };
  

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    submitRating(rating);
  };

  const fetchRatingData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/predictions/${gameTitle}/${journalist}/`, // Ensure this is the correct endpoint for get_user_ratings
        { withCredentials: true }
      );
  
      const fetchedData = response.data;
      console.log('Fetched Data:', fetchedData); // Log the response
  
      // Update the ratings for the graph
      const ratingsArray = fetchedData.ratings || [];
      const mappedData = mapDataToGraph(ratingsArray);
      setRatingData(mappedData);
  
      // Check if the user has already submitted a rating
      const userSubmitted = fetchedData.user_submitted;
      const userRatingFromResponse = fetchedData.user_rating;
      console.log('User Submitted:', userSubmitted);
      console.log('User Rating from Response:', userRatingFromResponse);
  
      // Update the state based on the user's submission status
      setUserSubmittedRating(userSubmitted);
      setUserRating(userRatingFromResponse || null);
      
    } catch (error) {
      console.error('Error fetching ratings data:', error);
    }
  };
  
  const mapDataToGraph = (data) => {
    const ratingsArray = Array(10).fill(0);
    data.forEach(item => {
      const ratingIndex = item.predicted_rating - 1;
      if (ratingIndex >= 0 && ratingIndex < 10) {
        ratingsArray[ratingIndex] += item.count;
      }
    });
    return ratingsArray;
  };

  const graphData = ratingData && {
    labels: [...Array(10).keys()].map(i => (i + 1).toString()),
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
