import React, { useState } from 'react';
import './RatingBadge.css'; // Add your hexagon styles here

const RatingBadge = ({ initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating || '');

  const handleRatingChange = (e) => {
    const newRating = e.target.value;
    if (newRating >= 1 && newRating <= 10) {
      setRating(newRating);
      onRatingChange(newRating); // Notify the parent component
    }
  };

  return (
    <div className="rating-container">
      <div className="hexagon">
        <span className="rating-value">{rating || '0.0'}</span>
      </div>
      <div className="rating-input">
        <input
          type="number"
          step="0.1"
          min="1"
          max="10"
          placeholder=""
          value={rating}
          onChange={handleRatingChange}
        />
      </div>
    </div>
  );
};

export default RatingBadge;
 