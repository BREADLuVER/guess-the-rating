import React, { useState } from 'react';
import './RatingBadge.css';

const RatingBadge = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating || '');

  const handleRatingChange = (e) => {
    const newRating = e.target.value;
    if (newRating >= 1 && newRating <= 10 && Number.isInteger(Number(newRating))) {
      setRating(newRating);
    }
  };

  const handleSubmit = () => {
    if (rating >= 1 && rating <= 10 && Number.isInteger(Number(rating))) {
      onRatingChange(rating); // Notify parent component of the rating
    } else {
      alert('Please enter a valid integer rating between 1 and 10');
    }
  };

  return (
    <div className="rating-container">
      <div className="hexagon">
        <span className="rating-value">{rating || '0'}</span>
      </div>
      <div className="rating-input">
        <input
          type="number"
          step="1" // Force input to be integers
          min="1"
          max="10"
          placeholder="Enter rating"
          value={rating}
          onChange={handleRatingChange}
        />
        <button className="submit-button" onClick={handleSubmit}>
          &#x23CE; {/* Enter key symbol */}
        </button>
      </div>
    </div>
  );
};

export default RatingBadge;
