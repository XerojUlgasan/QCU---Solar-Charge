import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { authenticatedGet, API_BASE_URL } from '../utils/api';
import logo from '../logo.svg';
import "../styles/RateUs.css";


function RateUs() {
    const { showSuccess, showError } = useNotification();
    const { openModal } = useGoogleLogin();
    const { user, idToken, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const { onCollectionChange, isConnected } = useSocket();
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(null); // Store user's specific rating with ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [stationLocations, setStationLocations] = useState([]); // Store station locations from API
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', or 'ratings'
    const [starFilter, setStarFilter] = useState('all'); // 'all', '1', '2', '3', '4', '5'
    const [locationError, setLocationError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        rating: 0,
        comment: '',
        location: ''
    });

    // Fetch reviews from API
    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build URL with email query parameter if user is authenticated
            let url = API_BASE_URL + '/rates/getrates';
            if (user?.email) {
                url += `?email=${encodeURIComponent(user.email)}`;
            }
            
            const response = await authenticatedGet(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 RateUs API response:', data);
            
            // Handle new API response structure
            const reviewsData = data.ratings || data.value || data;
            const stationLocationsData = data.station_locations || [];
            
            console.log('📊 Station locations data:', stationLocationsData);
            
            // Fetch updated device information from admin dashboard
            try {
                const deviceResponse = await authenticatedGet(API_BASE_URL + '/admin/dashboard');
                if (deviceResponse.ok) {
                    const deviceData = await deviceResponse.json();
                    console.log('📊 Device data from dashboard:', deviceData);
                    
                    // Use real device data for station locations
                    if (deviceData.devices && Array.isArray(deviceData.devices)) {
                        const updatedStationLocations = deviceData.devices.map(device => ({
                            device_id: device.device_id,
                            location: device.location,
                            building: device.building,
                            name: device.name
                        }));
                        
                        console.log('✅ Updated station locations from dashboard:', updatedStationLocations);
                        setStationLocations(updatedStationLocations);
                    } else {
                        // Fallback to original station locations
                        if (Array.isArray(stationLocationsData)) {
                            console.log('✅ Station locations loaded successfully:', stationLocationsData.length, 'locations');
                            setStationLocations(stationLocationsData);
                        } else {
                            console.warn('⚠️ Station locations data is not an array:', stationLocationsData);
                            setStationLocations([]);
                        }
                    }
                } else {
                    // Fallback to original station locations
                    if (Array.isArray(stationLocationsData)) {
                        console.log('✅ Station locations loaded successfully:', stationLocationsData.length, 'locations');
                        setStationLocations(stationLocationsData);
                    } else {
                        console.warn('⚠️ Station locations data is not an array:', stationLocationsData);
                        setStationLocations([]);
                    }
                }
            } catch (deviceError) {
                console.warn('⚠️ Failed to fetch device data, using fallback:', deviceError);
                // Fallback to original station locations
                if (Array.isArray(stationLocationsData)) {
                    console.log('✅ Station locations loaded successfully:', stationLocationsData.length, 'locations');
                    setStationLocations(stationLocationsData);
                } else {
                    console.warn('⚠️ Station locations data is not an array:', stationLocationsData);
                    setStationLocations([]);
                }
            }
            
            // If user is logged in and we have their specific rating data, store it separately
            if (user?.email && Array.isArray(reviewsData)) {
                const userSpecificRating = reviewsData.find(rating => rating.email === user.email);
                if (userSpecificRating) {
                    console.log('✅ Found user-specific rating with ID:', userSpecificRating);
                    console.log('📊 User rating ID field:', userSpecificRating.id);
                    console.log('📊 User rating all fields:', Object.keys(userSpecificRating));
                    setUserRating(userSpecificRating);
                } else {
                    console.log('❌ No user-specific rating found');
                    setUserRating(null);
                }
            } else {
                setUserRating(null);
            }
            
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to normalize timestamp from socket data
    const normalizeTimestamp = (timestamp, isNew = false) => {
        // For new items, use current time to show "just now" if no timestamp
        if (isNew && !timestamp) {
            return { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        }
        
        if (!timestamp) {
            return { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        }
        
        // If already in Firestore format, return as is
        if (typeof timestamp === 'object' && timestamp.seconds) {
            return timestamp;
        }
        
        // If it's a string, try to parse it
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
            }
        }
        
        // If it's a Date object
        if (timestamp instanceof Date) {
            return { seconds: Math.floor(timestamp.getTime() / 1000), nanoseconds: 0 };
        }
        
        // Fallback to current time
        return { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
    };

    // Listen to socket changes and update reviews array directly
    useEffect(() => {
        if (!isConnected) return;

        // Listen to ratings changes
        const cleanupRatings = onCollectionChange('ratings', (data) => {
            console.log('📡 Rating change detected in RateUs:', data);
            
            setReviews(prevReviews => {
                const { type, id, data: ratingData } = data;
                
                // Helper function to check if a review matches the ID
                const matchesId = (review, checkId) => {
                    return review.id === checkId || 
                           review.rating_id === checkId || 
                           review.rate_id === checkId ||
                           review._id === checkId ||
                           (ratingData.email && review.email === ratingData.email && checkId === id);
                };
                
                if (type === 'added') {
                    // Add new rating to the array - check all possible ID fields
                    const ratingExists = prevReviews.some(review => matchesId(review, id));
                    if (!ratingExists) {
                        console.log('➕ Adding new rating:', id);
                        
                        // Normalize timestamp - for new items, ensure it shows "just now"
                        // Ensure all possible ID fields are set
                        const normalizedData = {
                            ...ratingData,
                            id: id || ratingData.id || ratingData.rating_id || ratingData.rate_id || ratingData._id,
                            rating_id: ratingData.rating_id || id,
                            rate_id: ratingData.rate_id || id,
                            dateTime: normalizeTimestamp(
                                ratingData.dateTime || ratingData.timestamp || ratingData.created_at,
                                true // isNew = true for new ratings
                            ),
                            _isNew: true // Flag for animation
                        };
                        
                        // Check if this is the user's own rating
                        if (user?.email && normalizedData.email === user.email) {
                            setUserRating(normalizedData);
                        }
                        return [...prevReviews, normalizedData];
                    }
                } else if (type === 'modified') {
                    // Update existing rating - preserve original dateTime
                    // Check all possible ID fields and email match
                    console.log('🔄 Updating rating:', id);
                    const updatedReviews = prevReviews.map(review => {
                        if (matchesId(review, id)) {
                            // Preserve the original dateTime from the existing review
                            const existingDateTime = review.dateTime;
                            const newDateTime = ratingData.dateTime || ratingData.timestamp || ratingData.created_at;
                            
                            // Use existing dateTime if it exists, otherwise normalize the new one
                            const preservedDateTime = existingDateTime || normalizeTimestamp(newDateTime, false);
                            
                            // Ensure all ID fields are preserved
                            return {
                                ...review,
                                ...ratingData,
                                id: id || ratingData.id || review.id || ratingData.rating_id || ratingData.rate_id,
                                rating_id: ratingData.rating_id || review.rating_id || id,
                                rate_id: ratingData.rate_id || review.rate_id || id,
                                dateTime: preservedDateTime, // Keep original submission time
                                _isNew: false // Remove animation flag
                            };
                        }
                        return review;
                    });
                    
                    // Update userRating if it's the user's rating
                    if (user?.email && ratingData.email === user.email) {
                        const existingReview = prevReviews.find(r => matchesId(r, id));
                        const updatedUserRating = {
                            ...ratingData,
                            id: id || ratingData.id || ratingData.rating_id || ratingData.rate_id,
                            rating_id: ratingData.rating_id || id,
                            rate_id: ratingData.rate_id || id,
                            dateTime: existingReview?.dateTime || normalizeTimestamp(
                                ratingData.dateTime || ratingData.timestamp || ratingData.created_at,
                                false
                            )
                        };
                        setUserRating(updatedUserRating);
                    }
                    return updatedReviews;
                } else if (type === 'removed') {
                    // Remove rating from array - check all possible ID fields
                    console.log('➖ Removing rating:', id);
                    const filteredReviews = prevReviews.filter(review => !matchesId(review, id));
                    // Clear userRating if it was removed
                    if (userRating && matchesId(userRating, id)) {
                        setUserRating(null);
                    }
                    return filteredReviews;
                }
                
                return prevReviews;
            });
        });

        // Listen to device changes (for station locations)
        const cleanupDevices = onCollectionChange('devices', (data) => {
            console.log('📡 Device change detected in RateUs, updating station locations...', data);
            
            setStationLocations(prevLocations => {
                const { type, id, data: deviceData } = data;
                const deviceId = id || deviceData?.id || deviceData?.device_id;
                
                if (type === 'added' || type === 'modified') {
                    const locationExists = prevLocations.some(loc => loc.device_id === deviceId);
                    const newLocation = {
                        device_id: deviceId,
                        location: deviceData.location,
                        building: deviceData.building,
                        name: deviceData.name
                    };
                    
                    if (locationExists) {
                        return prevLocations.map(loc => 
                            loc.device_id === deviceId ? newLocation : loc
                        );
                    } else {
                        return [...prevLocations, newLocation];
                    }
                } else if (type === 'removed') {
                    return prevLocations.filter(loc => loc.device_id !== deviceId);
                }
                
                return prevLocations;
            });
        });

        return () => {
            cleanupRatings();
            cleanupDevices();
        };
    }, [isConnected, onCollectionChange, user?.email, userRating]);

    // Fetch reviews when component mounts or when authentication state changes
    useEffect(() => {
        fetchReviews();
    }, [idToken]); // Refetch when token changes

    // Remove _isNew flag after animation completes
    useEffect(() => {
        const timer = setTimeout(() => {
            setReviews(prevReviews => 
                prevReviews.map(review => {
                    if (review._isNew) {
                        const { _isNew, ...rest } = review;
                        return rest;
                    }
                    return review;
                })
            );
        }, 600); // Animation duration + small buffer

        return () => clearTimeout(timer);
    }, [reviews]);

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
        
        return reviews
            .map(review => {
                // Find matching device info from station locations with detailed logging
                console.log('🔍 Review data:', {
                    reviewId: review.id || review.rate_id || review._id,
                    device_id: review.device_id,
                    location: review.location,
                    building: review.building,
                    station: review.station
                });
                
                console.log('📊 Available station locations:', stationLocations.map(d => ({
                    device_id: d.device_id,
                    location: d.location,
                    building: d.building,
                    name: d.name
                })));
                
                // Try multiple matching strategies in order of preference
                let deviceInfo = null;
                
                // Strategy 1: Exact device_id match (most reliable)
                if (review.device_id) {
                    deviceInfo = stationLocations.find(device => device.device_id === review.device_id);
                    if (deviceInfo) {
                        console.log(`✅ Matched by device_id: ${review.device_id}`);
                    }
                }
                
                // Strategy 2: Exact location + building match
                if (!deviceInfo && review.location && review.building) {
                    deviceInfo = stationLocations.find(device => 
                        device.location === review.location && device.building === review.building
                    );
                    if (deviceInfo) {
                        console.log(`✅ Matched by location+building: ${review.location} + ${review.building}`);
                    }
                }
                
                // Strategy 3: Partial building match (for cases where building name changed)
                if (!deviceInfo && review.building) {
                    deviceInfo = stationLocations.find(device => {
                        // Check if building names are similar (handles cases like "Academic Building" vs "Academic Building 1")
                        const reviewBuilding = review.building.toLowerCase().trim();
                        const deviceBuilding = device.building.toLowerCase().trim();
                        
                        // Exact match
                        if (reviewBuilding === deviceBuilding) return true;
                        
                        // Partial match (one contains the other)
                        if (reviewBuilding.includes(deviceBuilding) || deviceBuilding.includes(reviewBuilding)) {
                            console.log(`🔍 Partial building match: "${reviewBuilding}" vs "${deviceBuilding}"`);
                            return true;
                        }
                        
                        return false;
                    });
                    if (deviceInfo) {
                        console.log(`✅ Matched by partial building: ${review.building}`);
                    }
                }
                
                // Strategy 4: Exact location match
                if (!deviceInfo && review.location) {
                    deviceInfo = stationLocations.find(device => device.location === review.location);
                    if (deviceInfo) {
                        console.log(`✅ Matched by location: ${review.location}`);
                    }
                }
                
                // Strategy 5: Exact building match
                if (!deviceInfo && review.building) {
                    deviceInfo = stationLocations.find(device => device.building === review.building);
                    if (deviceInfo) {
                        console.log(`✅ Matched by building: ${review.building}`);
                    }
                }
                
                if (!deviceInfo) {
                    console.log('❌ No device match found for review');
                }
                
                console.log('✅ Final device match:', deviceInfo);
                
                const formattedReview = {
                    id: review.id || review.rate_id || review._id, // Preserve ID for updates
                    email: review.email, // Preserve email for user matching
                    user: review.name || 'Anonymous',
                    rating: review.rate || 0,
                    comment: review.comment || 'No comment provided',
                    station: review.location || 'Unknown Location',
                    building: deviceInfo?.building || review.building || review.location || 'Unknown Building',
                    location: deviceInfo?.location || review.location || 'Unknown Location',
                    date: formatDate(review.dateTime),
                    avatar: getUserAvatar(review),
                    photo_url: review.photo_url, // Preserve photo URL for user matching
                    rawDateTime: review.dateTime // Keep original dateTime for sorting
                };
                
                console.log('📝 Final formatted review:', {
                    id: formattedReview.id,
                    originalBuilding: review.building,
                    originalLocation: review.location,
                    deviceInfoBuilding: deviceInfo?.building,
                    deviceInfoLocation: deviceInfo?.location,
                    finalBuilding: formattedReview.building,
                    finalLocation: formattedReview.location
                });
                
                return formattedReview;
            })
            .sort((a, b) => {
                // Sort by dateTime in descending order (latest first)
                if (!a.rawDateTime || !b.rawDateTime) return 0;
                
                // Handle Firestore timestamp format
                if (a.rawDateTime.seconds && b.rawDateTime.seconds) {
                    return b.rawDateTime.seconds - a.rawDateTime.seconds;
                }
                
                // Handle regular Date objects or ISO strings
                const dateA = new Date(a.rawDateTime);
                const dateB = new Date(b.rawDateTime);
                return dateB - dateA;
            })
            .map(review => ({
                // Keep rawDateTime for sorting purposes and preserve ID for animation matching
                id: review.id, // Preserve ID for matching with original reviews
                user: review.user,
                rating: review.rating,
                comment: review.comment,
                station: review.station,
                building: review.building,
                location: review.location,
                date: review.date,
                avatar: review.avatar,
                rawDateTime: review.rawDateTime // Keep for sorting
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

    const allReviews = formatReviews();
    const recentReviews = allReviews.slice(0, 5); // Show only first 5 reviews

    // Check if current user has already submitted a rating
    const getUserExistingRating = () => {
        // Use the user's specific rating data (with ID) if available
        if (userRating) {
            console.log('✅ Using user-specific rating:', userRating);
            
            // Find matching device info for building
            const deviceInfo = stationLocations.find(device => 
                device.device_id === userRating.device_id || 
                device.location === userRating.location ||
                device.building === userRating.building
            );
            
            return {
                id: userRating.id || userRating.rate_id || userRating._id,
                rating: userRating.rate || 0,
                comment: userRating.comment || '',
                location: deviceInfo?.location || userRating.location || '',
                building: deviceInfo?.building || userRating.building || '',
                date: formatDate(userRating.dateTime)
            };
        }
        
        // Fallback to finding in general reviews (for display purposes)
        if (!user?.email || !allReviews || allReviews.length === 0) return null;
        
        const userReview = allReviews.find(review => review.email === user.email);
        if (userReview) {
            console.log('⚠️ Using general review (no ID available):', userReview);
            return {
                id: null, // No ID available in general reviews
                rating: userReview.rating,
                comment: userReview.comment,
                location: userReview.location,
                building: userReview.building,
                date: userReview.date
            };
        }
        
        return null;
    };

    const userExistingRating = getUserExistingRating();

    // Filter and sort reviews for modal
    const getFilteredReviews = () => {
        let filtered = [...allReviews];

        // Filter by star rating
        if (starFilter !== 'all') {
            filtered = filtered.filter(review => review.rating === parseInt(starFilter));
        }

        // Sort reviews
        if (sortBy === 'newest') {
            // Already sorted by newest in formatReviews, so no change needed
        } else if (sortBy === 'oldest') {
            filtered = filtered.sort((a, b) => {
                // Sort by dateTime in ascending order (oldest first)
                if (!a.rawDateTime || !b.rawDateTime) {
                    // Fallback to formatted date if rawDateTime not available
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateA.getTime() - dateB.getTime();
                }
                
                // Handle Firestore timestamp format
                if (a.rawDateTime.seconds && b.rawDateTime.seconds) {
                    return a.rawDateTime.seconds - b.rawDateTime.seconds;
                }
                
                // Handle regular Date objects or ISO strings
                const dateA = new Date(a.rawDateTime);
                const dateB = new Date(b.rawDateTime);
                return dateA.getTime() - dateB.getTime();
            });
        } else if (sortBy === 'ratings') {
            filtered = filtered.sort((a, b) => b.rating - a.rating);
        }

        return filtered;
    };

    const filteredReviews = getFilteredReviews();

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

    // Handle edit mode
    const handleEditRating = () => {
        if (userExistingRating) {
            setEditData({
                rating: userExistingRating.rating,
                comment: userExistingRating.comment || '',
                location: userExistingRating.location
            });
            setIsEditing(true);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({
            rating: 0,
            comment: '',
            location: ''
        });
    };

    // Handle update rating
    const handleUpdateRating = async () => {
        if (editData.rating === 0) return;
        
        // Validate location
        if (!editData.location) {
            setLocationError('Please select an item in the list.');
            return;
        } else {
            setLocationError('');
        }
        
        if (!isAuthenticated) {
            openModal();
            return;
        }
        
        setSubmittingRating(true);
        
        try {
            // Prepare rating data for update using the correct API structure
            const ratingData = {
                rate_id: userExistingRating.id || userExistingRating.rate_id || userExistingRating._id, // Required: the ID of the rating to update
                rate: editData.rating, // Required: the new rating value
                comment: editData.comment || '', // Optional: the new comment
                location: editData.location, // Required: the location field
                building: editData.location // Required: the building field (same as location)
            };
            
            // Validate that we have a rate_id
            if (!ratingData.rate_id) {
                throw new Error('Rating ID not found. Cannot update rating without ID.');
            }
            
            console.log('🔄 Updating rating with data:', ratingData);
            console.log('📊 User existing rating:', userExistingRating);
            console.log('📊 Available rating fields:', Object.keys(userExistingRating));
            console.log('📊 Rating ID found:', ratingData.rate_id);
            console.log('📊 Edit data:', editData);
            console.log('📊 User rating state:', userRating);
            console.log('📊 All reviews:', allReviews);
            
            // Additional validation
            if (!ratingData.rate_id) {
                console.error('❌ No rate_id found in:', ratingData);
                throw new Error('Rating ID not found. Cannot update rating without ID.');
            }
            
            if (!ratingData.building) {
                console.error('❌ No building found in:', ratingData);
                throw new Error('Building/location is required for update.');
            }
            
            if (!ratingData.location) {
                console.error('❌ No location found in:', ratingData);
                throw new Error('Location is required for update.');
            }
            
            // Use the correct endpoint for editing ratings
            const endpoint = API_BASE_URL + '/rates/editrates';
            console.log('📡 Making POST request to:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData)
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            
            if (response.ok) {
                const responseData = await response.json();
                
                // Check if the response indicates success
                if (responseData.success === false || responseData.error) {
                    throw new Error(responseData.message || 'Server returned error');
                }
                
                showSuccess('Rating updated successfully!');
                setIsEditing(false);
                
                // Socket will handle the update, no need to refetch
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            showError(`Failed to update rating: ${error.message}`);
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleSubmitRating = async () => {
        if (selectedRating === 0) return;
        
        // Validate location
        if (!selectedLocation) {
            setLocationError('Please select an item in the list.');
            return;
        } else {
            setLocationError('');
        }
        
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
            
            // Use the correct endpoint for posting ratings
            const endpoint = API_BASE_URL + '/rates/postRates';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData)
            });
            
            if (response.ok) {
                const responseData = await response.json();
                
                // Check if the response indicates success
                if (responseData.success === false || responseData.error) {
                    // Handle specific error cases
                    if (responseData.message && responseData.message.includes('already submitted')) {
                        showError('You have already submitted a rating. Each user can only submit one rating.');
                        return;
                    }
                    throw new Error(responseData.message || 'Server returned error');
                }
                
        showSuccess(`Thank you for rating us ${selectedRating} star${selectedRating > 1 ? 's' : ''}!`);
        setSelectedRating(0);
        setFeedback('');
                setSelectedLocation('');
                
                // Socket will handle the update, no need to refetch
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showError(`Failed to submit rating: ${error.message}`);
        } finally {
            setSubmittingRating(false);
        }
    };


    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return [...Array(5)].map((_, index) => {
            const starNumber = index + 1;
            const isFilled = interactive 
                ? starNumber <= (hoveredRating || (onRatingChange ? rating : selectedRating))
                : starNumber <= rating;
            
            return (
                <svg
                    key={index}
                    className={`star-icon ${isFilled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={() => {
                        if (interactive) {
                            if (onRatingChange) {
                                onRatingChange(starNumber);
                            } else {
                                setSelectedRating(starNumber);
                            }
                        }
                    }}
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
        <div id="rate-us-page" className={isDarkMode ? '' : 'light'} style={{
            backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
            color: isDarkMode ? '#eaecef' : '#1f2937'
        }}>
            <div className="container">
                {/* Header */}
                <div className="header">
                    <span className="badge-yellow inline-block mb-4 w-fit" style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '12px',
                        backgroundColor: isDarkMode ? '#f59e0b' : '#f59e0b',
                        color: isDarkMode ? '#ffffff' : '#ffffff',
                        border: isDarkMode ? 'none' : '1px solid #f59e0b'
                    }}>Your Feedback Matters</span>
                    <h1 style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Rate Your Experience</h1>
                    <p className="subtitle" style={{
                        color: isDarkMode ? '#9aa3b2' : '#374151'
                    }}>
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
                        {/* Community Impact Stats */}
                        <div className="stats-card" style={{
                            backgroundColor: isDarkMode ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div className="stats-header">
                                <h3 className="stats-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Community Impact</h3>
                                <p className="stats-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                    Real-time statistics from our QCU EcoCharge community
                                </p>
                            </div>
                            <div className="stats-content">
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value green" style={{color: isDarkMode ? '#22c55e' : '#22c55e'}}>{communityStats.satisfactionRate}%</div>
                                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Satisfaction Rate</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value blue" style={{color: isDarkMode ? '#3b82f6' : '#3b82f6'}}>{communityStats.averageResponseTime}</div>
                                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Avg Response Time</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value purple" style={{color: isDarkMode ? '#8b5cf6' : '#8b5cf6'}}>{communityStats.improvementsCount}</div>
                                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Feedback Provided</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value yellow" style={{color: isDarkMode ? '#f59e0b' : '#f59e0b'}}>{communityStats.totalUsers}</div>
                                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Active Users</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overall Rating */}
                        <div className="card" style={{
                            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div className="card-header text-center">
                                <div className="average-rating" style={{color: isDarkMode ? '#22c55e' : '#22c55e'}}>{averageRating}</div>
                                <div className="stars-display">
                                    {renderStars(parseFloat(averageRating))}
                                </div>
                                <div className="rating-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                    Based on {totalReviews} reviews
                                </div>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="card" style={{
                            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div className="card-header">
                                <h3 className="card-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Rating Breakdown</h3>
                            </div>
                            <div className="card-content">
                                <div className="rating-breakdown">
                                    {ratingDistribution.map((item) => (
                                        <div key={item.stars} className="rating-row">
                                            <div className="rating-label">
                                                <span className="star-count" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{item.stars}</span>
                                                <svg className="star-small" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                                </svg>
                                            </div>
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{
                                                    backgroundColor: isDarkMode ? '#1e2633' : '#e5e7eb'
                                                }}>
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                            background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #22c55e, #3b82f6)'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <span className="rating-count" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Rating */}
                        <div className="card" style={{
                            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div className="card-header">
                                <h3 className="card-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Rate Our Service</h3>
                                <p className="card-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                    How would you rate your overall experience with QCU EcoCharge?
                                </p>
                            </div>
                            <div className="card-content">
                                {userExistingRating && !isEditing ? (
                                    <div className="existing-rating">
                                        <div className="existing-rating-header">
                                            <h4>Your Previous Rating</h4>
                                            <span className="rating-date">Submitted {userExistingRating.date}</span>
                                        </div>
                                        <div className="existing-rating-content">
                                            <div className="existing-rating-stars">
                                                {renderStars(userExistingRating.rating)}
                                                <span className="rating-text">{userExistingRating.rating} star{userExistingRating.rating > 1 ? 's' : ''}</span>
                                            </div>
                                            {userExistingRating.comment && (
                                                <p className="existing-rating-comment">"{userExistingRating.comment}"</p>
                                            )}
                                            <div className="existing-rating-location">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                <span>{userExistingRating.location && userExistingRating.building ? `${userExistingRating.location} • ${userExistingRating.building}` : userExistingRating.location}</span>
                                            </div>
                                        </div>
                                        <div className="existing-rating-actions">
                                            <button onClick={handleEditRating} className="edit-rating-btn">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit Rating
                                            </button>
                                        </div>
                                    </div>
                                ) : isEditing ? (
                                    <div className="edit-rating">
                                        <div className="edit-rating-header">
                                            <h4>Edit Your Rating</h4>
                                            <button onClick={handleCancelEdit} className="cancel-edit-btn">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                                Cancel
                                            </button>
                                        </div>
                                        <div className="rating-input">
                                            <div className="stars-interactive">
                                                {renderStars(editData.rating, true, (rating) => setEditData({...editData, rating}))}
                                            </div>
                                            
                                            {editData.rating > 0 && (
                                                <div className="rating-submit">
                                                    <p className="rating-selected">
                                                        You rated us {editData.rating} star{editData.rating > 1 ? 's' : ''}. 
                                                        {editData.rating <= 2 ? ' We\'d love to hear how we can improve!' : 
                                                         editData.rating <= 4 ? ' Thanks for the feedback!' : 
                                                         ' Thank you so much for the amazing rating!'}
                                                    </p>
                                                    
                                                    <div className="form-group">
                                                        <label htmlFor="editLocation" className="form-label">
                                                            Station Location *
                                                        </label>
                                                        <select 
                                                            id="editLocation"
                                                            value={editData.location} 
                                                            onChange={(e) => setEditData({...editData, location: e.target.value})}
                                                            className="form-select"
                                                            required
                                                        >
                                                            <option value="">Select location</option>
                                                            {stationLocations.map((station) => (
                                                                <option key={station.device_id} value={station.building || station.location}>
                                                                    {station.location && station.building ? `${station.location} • ${station.building}` : (station.building || station.location)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {locationError && <p className="error-message">{locationError}</p>}
                                                    </div>
                                                    
                                                    <div className="form-group">
                                                        <label htmlFor="editFeedback" className="form-label">
                                                            Additional Comments (Optional)
                                                        </label>
                                                        <textarea
                                                            id="editFeedback"
                                                            placeholder="Share your experience or suggestions for improvement..."
                                                            className="form-textarea"
                                                            value={editData.comment}
                                                            onChange={(e) => setEditData({...editData, comment: e.target.value})}
                                                            rows="4"
                                                        />
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={handleUpdateRating} 
                                                        disabled={submittingRating}
                                                        className={`submit-button ${submittingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {submittingRating ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                                    <path d="M20 6L9 17l-5-5"></path>
                                                                </svg>
                                                                Update Rating
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
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
                                                <label className="feedback-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                                    Location
                                                </label>
                                                <select
                                                    className={`feedback-textarea ${locationError ? 'error' : ''}`}
                                                    value={selectedLocation}
                                                    onChange={(e) => {
                                                        setSelectedLocation(e.target.value);
                                                        if (e.target.value) {
                                                            setLocationError('');
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                                        border: isDarkMode ? '2px solid #1e2633' : '1px solid #d1d5db',
                                                        color: isDarkMode ? '#ffffff' : '#374151'
                                                    }}
                                                >
                                                    <option value="">Select location</option>
                                                    {stationLocations.map((station) => (
                                                        <option key={station.device_id} value={station.building || station.location}>
                                                            {station.location && station.building ? `${station.location} • ${station.building}` : (station.building || station.location)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {locationError && (
                                                    <div className="error-message-container">
                                                        <div className="error-icon">!</div>
                                                        <span className="error-text">{locationError}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="feedback-section">
                                                <label className="feedback-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                                    Share your experience (optional)
                                                </label>
                                                <textarea
                                                    className="feedback-textarea"
                                                    placeholder="Tell us about your experience with QCU EcoCharge..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows="4"
                                                    style={{
                                                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                                        border: isDarkMode ? '2px solid #1e2633' : '1px solid #d1d5db',
                                                        color: isDarkMode ? '#ffffff' : '#374151'
                                                    }}
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
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="reviews-section">
                        <div className="reviews-header">
                        <h2 className="section-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Recent Reviews</h2>
                            <button 
                                className="view-all-reviews-btn"
                                onClick={() => setShowAllReviewsModal(true)}
                                style={{
                                    backgroundColor: isDarkMode ? 'transparent' : 'transparent',
                                    border: isDarkMode ? '1px solid #1e2633' : '1px solid #d1d5db',
                                    color: isDarkMode ? '#9aa3b2' : '#374151'
                                }}
                            >
                                View All
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </button>
                        </div>
                        <div className="reviews-list">
                            {recentReviews.map((review, index) => {
                                // Find the original review to check if it's new
                                // Note: formatted reviews don't have _isNew, so we check the raw reviews array
                                const reviewId = review.id || review.rating_id;
                                const originalReview = reviews.find(r => 
                                    (r.id || r.rating_id || r.rate_id) === reviewId
                                );
                                const isNew = originalReview?._isNew || false;
                                
                                return (
                                <div 
                                    key={review.id || review.rating_id || index} 
                                    className={`review-card ${isNew ? 'slide-in-new' : ''}`}
                                    style={{
                                    backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
                                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                                    boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}>
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
                                            <h4 className="review-name" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{review.user}</h4>
                                            <div className="review-meta">
                                                <div className="review-stars">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="review-separator" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>•</span>
                                                <span className="review-date" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>{review.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <p className="review-comment" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>"{review.comment}"</p>
                                        <div className="review-location" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <span>{review.building && review.location ? `${review.location} • ${review.building}` : review.station}</span>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                                    </div>
                                </div>
                )}
            </div>

            {/* All Reviews Modal */}
            {showAllReviewsModal && (
                <div className="reviews-modal-overlay" onClick={() => setShowAllReviewsModal(false)}>
                    <div className="reviews-modal" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: isDarkMode ? '#1a1f2e' : '#ffffff',
                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                        boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div className="modal-header" style={{
                            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                            backgroundColor: isDarkMode ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))' : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.01))'
                        }}>
                            <div className="modal-app-info">
                                <div className="modal-app-icon">
                                    <img 
                                        src={logo} 
                                        alt="QCU EcoCharge Logo" 
                                        className="modal-logo"
                                    />
                                </div>
                                <div className="modal-app-details">
                                    <h3 className="modal-app-name" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>QCU EcoCharge</h3>
                                    <p className="modal-app-subtitle" style={{color: isDarkMode ? '#a1a9b8' : '#6b7280'}}>Ratings and reviews</p>
                                </div>
                            </div>
                            <button 
                                className="modal-close-btn"
                                onClick={() => setShowAllReviewsModal(false)}
                                style={{
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    color: isDarkMode ? '#a1a9b8' : '#6b7280'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18"/>
                                    <path d="M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-filters">
                            <div className="filter-dropdown-container">
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="ratings">Ratings</option>
                                </select>
                            </div>
                            <div className="filter-dropdown-container">
                                <select 
                                    value={starFilter} 
                                    onChange={(e) => setStarFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Star rating</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                                    </div>
                                    </div>

                        <div className="modal-reviews-list">
                            {filteredReviews.map((review, index) => {
                                // Find the original review to check if it's new
                                // Note: formatted reviews don't have _isNew, so we check the raw reviews array
                                const reviewId = review.id || review.rating_id;
                                const originalReview = reviews.find(r => 
                                    (r.id || r.rating_id || r.rate_id) === reviewId
                                );
                                const isNew = originalReview?._isNew || false;
                                
                                return (
                                <div 
                                    key={review.id || review.rating_id || index} 
                                    className={`modal-review-card ${isNew ? 'slide-in-new' : ''}`}
                                >
                                    <div className="modal-review-header">
                                        <div className="modal-review-user">
                                            <img 
                                                src={review.avatar} 
                                                alt={review.user}
                                                className="modal-review-avatar"
                                                onError={(e) => {
                                                    const encodedName = encodeURIComponent(review.user);
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
                                                }}
                                            />
                                            <div className="modal-review-user-info">
                                                <h4 className="modal-review-name">{review.user}</h4>
                                                <div className="modal-review-meta">
                                                    <div className="modal-review-stars">
                                                        {renderStars(review.rating)}
                                    </div>
                                                    <span className="modal-review-date">{review.date}</span>
                                    </div>
                                </div>
                            </div>
                                        <button className="modal-review-more-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="1"/>
                                                <circle cx="19" cy="12" r="1"/>
                                                <circle cx="5" cy="12" r="1"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="modal-review-content">
                                        <p className="modal-review-text">"{review.comment}"</p>
                                        <div className="modal-review-location">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            <span>{review.building && review.location ? `${review.location} • ${review.building}` : review.station}</span>
                        </div>
                            </div>
                        </div>
                                );
                            })}
                    </div>
                </div>
            </div>
            )}

        </div>
    );
}

export default RateUs;

