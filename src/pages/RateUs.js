import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';
import { useAuth } from '../contexts/AuthContext';
import { authenticatedGet, authenticatedPost } from '../utils/api';
import "../styles/RateUs.css";

function RateUs() {
    const { showSuccess, showError } = useNotification();
    const { openModal } = useGoogleLogin();
    const { user, idToken, isAuthenticated } = useAuth();
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('QCU Campus');

    // Fetch reviews from API
    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await authenticatedGet('https://api-qcusolarcharge.up.railway.app/rates/getRates');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            // Handle API response structure - data might be wrapped in 'value' property
            const reviewsData = data.value || data;
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch reviews when component mounts or when authentication state changes
    useEffect(() => {
        fetchReviews();
    }, [idToken]); // Refetch when token changes

    // Calculate rating distribution from API data
    const calculateRatingDistribution = () => {
        if (!reviews || reviews.length === 0) {
            return [
                { stars: 5, count: 0, percentage: 0 },
                { stars: 4, count: 0, percentage: 0 },
                { stars: 3, count: 0, percentage: 0 },
                { stars: 2, count: 0, percentage: 0 },
                { stars: 1, count: 0, percentage: 0 }
            ];
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        reviews.forEach(review => {
            if (review.rate >= 1 && review.rate <= 5) {
                distribution[review.rate]++;
            }
        });

        const totalReviews = reviews.length;
        
        return [5, 4, 3, 2, 1].map(stars => ({
            stars,
            count: distribution[stars],
            percentage: totalReviews > 0 ? Math.round((distribution[stars] / totalReviews) * 100) : 0
        }));
    };

    const ratingDistribution = calculateRatingDistribution();
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
        ? (reviews.reduce((sum, review) => sum + (review.rate || 0), 0) / totalReviews).toFixed(1)
        : '0.0';

    // Format reviews for display
    const formatReviews = () => {
        if (!reviews || reviews.length === 0) return [];
        
        return reviews.map(review => ({
            user: review.name || 'Anonymous',
            rating: review.rate || 0,
            comment: review.comment || 'No comment provided',
            station: review.location || 'Unknown Location',
            date: formatDate(review.dateTime),
            avatar: getUserAvatar(review)
        }));
    };

    // Get user's profile picture or fallback to generated avatar
    const getUserAvatar = (review) => {
        // First check if the review has a photo field (from API)
        if (review?.photo) {
            return review.photo;
        }
        
        // Fallback to generated avatar based on name
        const displayName = review?.name || 'Anonymous';
        const encodedName = encodeURIComponent(displayName);
        return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
    };

    // Format date for display
    const formatDate = (dateTime) => {
        if (!dateTime) return 'Unknown date';
        
        try {
            let date;
            
            // Handle Firestore timestamp format
            if (dateTime && typeof dateTime === 'object' && dateTime.seconds) {
                // Firestore timestamp: { seconds: number, nanoseconds: number }
                date = new Date(dateTime.seconds * 1000);
            } else if (typeof dateTime === 'string') {
                // ISO string format
                date = new Date(dateTime);
            } else if (dateTime instanceof Date) {
                // Already a Date object
                date = dateTime;
            } else {
                // Try to parse as regular date
                date = new Date(dateTime);
            }
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Unknown date';
            }
            
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            // More granular time display
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays === 1) return '1 day ago';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 14) return '1 week ago';
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        } catch (error) {
            console.error('Date formatting error:', error, dateTime);
            return 'Unknown date';
        }
    };

    const recentReviews = formatReviews();

    // Calculate community impact statistics from API data
    const calculateCommunityStats = () => {
        if (!reviews || reviews.length === 0) {
            return {
                satisfactionRate: 0,
                totalUsers: 0,
                averageResponseTime: 'N/A',
                improvementsCount: 0
            };
        }

        // Calculate satisfaction rate (4-5 star ratings)
        const satisfiedReviews = reviews.filter(review => review.rate >= 4);
        const satisfactionRate = Math.round((satisfiedReviews.length / reviews.length) * 100);

        // Count unique users (by email)
        const uniqueUsers = new Set(reviews.map(review => review.email)).size;

        // Calculate average response time (mock calculation based on review recency)
        const now = new Date();
        const responseTimes = reviews.map(review => {
            try {
                let reviewDate;
                
                // Handle Firestore timestamp format
                if (review.dateTime && typeof review.dateTime === 'object' && review.dateTime.seconds) {
                    reviewDate = new Date(review.dateTime.seconds * 1000);
                } else if (typeof review.dateTime === 'string') {
                    reviewDate = new Date(review.dateTime);
                } else {
                    reviewDate = new Date(review.dateTime);
                }
                
                // Check if date is valid
                if (isNaN(reviewDate.getTime())) {
                    return 24; // Default 24 hours
                }
                
                const diffHours = Math.abs(now - reviewDate) / (1000 * 60 * 60);
                return Math.min(diffHours, 72); // Cap at 72 hours
            } catch {
                return 24; // Default 24 hours
            }
        });
        const avgResponseTime = responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
            : 24;

        // Count improvements (reviews with comments)
        const improvementsCount = reviews.filter(review => review.comment && review.comment.trim().length > 0).length;

        return {
            satisfactionRate,
            totalUsers: uniqueUsers,
            averageResponseTime: avgResponseTime < 24 ? `${avgResponseTime}h` : `${Math.round(avgResponseTime / 24)}d`,
            improvementsCount
        };
    };

    const communityStats = calculateCommunityStats();

    const handleSubmitRating = async () => {
        if (selectedRating === 0) return;
        
        if (!isAuthenticated) {
            openModal();
            return;
        }
        
        setSubmittingRating(true);
        
        try {
            // Prepare rating data (excluding dateTime as API handles it)
            const ratingData = {
                name: user?.displayName || 'Anonymous',
                email: user?.email || '',
                rate: selectedRating,
                comment: feedback || '',
                location: selectedLocation,
                photo_url: user?.photoURL || null
            };
            
            console.log('Submitting rating data:', ratingData);
            console.log('User token available:', !!idToken);
            
            // Use the correct endpoint for posting ratings
            const endpoint = 'https://api-qcusolarcharge.up.railway.app/rates/postRates';
            
            console.log(`Submitting to endpoint: ${endpoint}`);
            const response = await authenticatedPost(endpoint, ratingData);
            console.log(`Response from ${endpoint}:`, response.status, response.ok);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('Success response:', responseData);
        showSuccess(`Thank you for rating us ${selectedRating} star${selectedRating > 1 ? 's' : ''}!`);
        setSelectedRating(0);
        setFeedback('');
                
                // Refresh reviews to show the new rating
                fetchReviews();
            } else {
                const errorText = await response.text();
                console.log(`Error from ${endpoint}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showError(`Failed to submit rating: ${error.message}`);
        } finally {
            setSubmittingRating(false);
        }
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

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading reviews...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchReviews} className="retry-button">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Main Content - only show when not loading and no error */}
                {!loading && !error && (
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
                                            
                                            <div className="feedback-section">
                                                <label className="feedback-label">
                                                    Location
                                                </label>
                                                <select
                                                    className="feedback-textarea"
                                                    value={selectedLocation}
                                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                                >
                                                    <option value="QCU Campus">QCU Campus</option>
                                                    <option value="Main Library">Main Library</option>
                                                    <option value="Student Center">Student Center</option>
                                                    <option value="Engineering Building">Engineering Building</option>
                                                    <option value="Sports Complex">Sports Complex</option>
                                                    <option value="Academic Building">Academic Building</option>
                                                </select>
                                            </div>
                                            
                                            <div className="feedback-section">
                                                <label className="feedback-label">
                                                    Share your experience (optional)
                                                </label>
                                                <textarea
                                                    className="feedback-textarea"
                                                    placeholder="Tell us about your experience with QCU EcoCharge..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows="4"
                                                />
                                            </div>
                                            
                                            <button 
                                                onClick={handleSubmitRating} 
                                                disabled={submittingRating}
                                                className={`submit-button ${submittingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {submittingRating ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                    <path d="M7 10v12"></path>
                                                    <path d="M15 5.88 10 9 5 5.88V10h10V5.88z"></path>
                                                    <path d="M13 15h3a3 3 0 0 1 0 6h-3"></path>
                                                </svg>
                                                Submit Rating
                                                    </>
                                                )}
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
                                            <div className="review-user-info">
                                                <img 
                                                    src={review.avatar} 
                                                    alt={review.user}
                                                    className="review-avatar"
                                                    onError={(e) => {
                                                        // Fallback to default avatar if image fails to load
                                                        const encodedName = encodeURIComponent(review.user);
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
                                                    }}
                                                />
                                                <div className="review-user-details">
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

                        {/* Community Impact Stats */}
                        <div className="stats-card">
                            <div className="stats-header">
                                <h3 className="stats-title">Community Impact</h3>
                                <p className="stats-description">
                                    Real-time statistics from our QCU EcoCharge community
                                </p>
                            </div>
                            <div className="stats-content">
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value green">{communityStats.satisfactionRate}%</div>
                                        <div className="stat-label">Satisfaction Rate</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value blue">{communityStats.averageResponseTime}</div>
                                        <div className="stat-label">Avg Response Time</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value purple">{communityStats.improvementsCount}</div>
                                        <div className="stat-label">Feedback Provided</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value yellow">{communityStats.totalUsers}</div>
                                        <div className="stat-label">Active Users</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

        </div>
    );
}

export default RateUs;
