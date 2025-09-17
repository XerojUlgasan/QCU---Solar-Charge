import React, { useState } from 'react';
import "../styles/RateUs.css";

function RateUs() {
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const recentReviews = [
        {
            user: "Sarah M.",
            rating: 5,
            comment: "Excellent service! The solar charging station saved my day when my phone was dying. Very convenient and eco-friendly.",
            station: "Main Library",
            date: "2 days ago"
        },
        {
            user: "Mike L.",
            rating: 4,
            comment: "Great concept and works well. Only wish there were more stations around campus.",
            station: "Student Center",
            date: "5 days ago"
        },
        {
            user: "Anna K.",
            rating: 5,
            comment: "Love the RFID feature! One hour of free charging per week is amazing for students.",
            station: "Engineering Building",
            date: "1 week ago"
        },
        {
            user: "John D.",
            rating: 4,
            comment: "Reliable charging and fast service. The app integration makes it easy to find available stations.",
            station: "Sports Complex",
            date: "1 week ago"
        }
    ];

    const ratingDistribution = [
        { stars: 5, count: 234, percentage: 68 },
        { stars: 4, count: 89, percentage: 26 },
        { stars: 3, count: 15, percentage: 4 },
        { stars: 2, count: 5, percentage: 1 },
        { stars: 1, count: 2, percentage: 1 }
    ];

    const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);
    const averageRating = (
        ratingDistribution.reduce((sum, item) => sum + (item.stars * item.count), 0) / totalReviews
    ).toFixed(1);

    const handleSubmitRating = () => {
        if (selectedRating === 0) return;
        
        // Mock rating submission
        alert(`Thank you for rating us ${selectedRating} star${selectedRating > 1 ? 's' : ''}!`);
        setSelectedRating(0);
    };

    const renderStars = (rating, interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starNumber = index + 1;
            const isFilled = interactive 
                ? starNumber <= (hoveredRating || selectedRating)
                : starNumber <= rating;
            
            return (
                <svg
                    key={index}
                    className={`star-icon ${isFilled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={() => interactive && setSelectedRating(starNumber)}
                    onMouseEnter={() => interactive && setHoveredRating(starNumber)}
                    onMouseLeave={() => interactive && setHoveredRating(0)}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
            );
        });
    };

    return (
        <div id="rate-us-page">
            <div className="container">
                {/* Header */}
                <div className="header">
                    <span className="badge-yellow">Your Feedback Matters</span>
                    <h1>Rate Your Experience</h1>
                    <p className="subtitle">
                        Help us improve our EcoCharge stations by sharing your experience. 
                        Your feedback helps us provide better service to the entire QCU community.
                    </p>
                </div>

                <div className="main-grid">
                    {/* Rating Section */}
                    <div className="rating-section">
                        {/* Overall Rating */}
                        <div className="card">
                            <div className="card-header text-center">
                                <div className="average-rating">{averageRating}</div>
                                <div className="stars-display">
                                    {renderStars(parseFloat(averageRating))}
                                </div>
                                <div className="rating-description">
                                    Based on {totalReviews} reviews
                                </div>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Rating Breakdown</h3>
                            </div>
                            <div className="card-content">
                                <div className="rating-breakdown">
                                    {ratingDistribution.map((item) => (
                                        <div key={item.stars} className="rating-row">
                                            <div className="rating-label">
                                                <span className="star-count">{item.stars}</span>
                                                <svg className="star-small" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                                </svg>
                                            </div>
                                            <div className="progress-container">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{width: `${item.percentage}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                            <span className="rating-count">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Rating */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Rate Our Service</h3>
                                <p className="card-description">
                                    How would you rate your overall experience with QCU EcoCharge?
                                </p>
                            </div>
                            <div className="card-content">
                                <div className="rating-input">
                                    <div className="stars-interactive">
                                        {renderStars(selectedRating, true)}
                                    </div>
                                    
                                    {selectedRating > 0 && (
                                        <div className="rating-submit">
                                            <p className="rating-selected">
                                                You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}
                                            </p>
                                            <button onClick={handleSubmitRating} className="submit-button">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                    <path d="M7 10v12"></path>
                                                    <path d="M15 5.88 10 9 5 5.88V10h10V5.88z"></path>
                                                    <path d="M13 15h3a3 3 0 0 1 0 6h-3"></path>
                                                </svg>
                                                Submit Rating
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="reviews-section">
                        <h2 className="section-title">Recent Reviews</h2>
                        <div className="reviews-list">
                            {recentReviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <div className="review-user">
                                            <h4 className="review-name">{review.user}</h4>
                                            <div className="review-meta">
                                                <div className="review-stars">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="review-separator">•</span>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <p className="review-comment">{review.comment}</p>
                                        <div className="review-location">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <span>{review.station}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Feedback Stats */}
                        <div className="stats-card">
                            <div className="stats-header">
                                <h3 className="stats-title">Community Impact</h3>
                                <p className="stats-description">
                                    Your feedback helps us serve the QCU community better
                                </p>
                            </div>
                            <div className="stats-content">
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value green">98%</div>
                                        <div className="stat-label">Satisfaction Rate</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value blue">24h</div>
                                        <div className="stat-label">Response Time</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value purple">15</div>
                                        <div className="stat-label">Improvements Made</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value yellow">1,200+</div>
                                        <div className="stat-label">Happy Users</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RateUs;
