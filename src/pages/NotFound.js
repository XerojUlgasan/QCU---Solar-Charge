import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-icon">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="120" 
                        height="120" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6"></path>
                        <path d="M12 16h.01"></path>
                    </svg>
                </div>
                
                <h1 className="not-found-title">This content isn't available right now</h1>
                
                <p className="not-found-description">
                    When this happens, it's usually because the owner only shared it with a small group of people, 
                    changed who can see it or it's been deleted.
                </p>
                
                <div className="not-found-actions">
                    <button 
                        className="go-home-button" 
                        onClick={handleGoHome}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        Go Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
