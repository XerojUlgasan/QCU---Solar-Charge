import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';
import "../styles/ReportProblem.css";

function ReportProblem() {
    const { showSuccess, showError } = useNotification();
    const { openModal } = useGoogleLogin();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        station: '',
        problemType: '',
        description: '',
        urgency: ''
    });

    // Check if user is already logged in on component mount
    useEffect(() => {
        const checkLoginState = () => {
            const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
            const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            
            if (userLoggedIn || adminLoggedIn) {
                const mockUser = {
                    id: 'user_123',
                    email: 'student@qcu.edu.ph',
                    name: 'John Doe',
                    picture: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
                };
                setUser(mockUser);
                setIsAuthenticated(true);
            }
        };
        
        checkLoginState();
        
        // Listen for storage changes (when user logs in/out from navbar)
        const handleStorageChange = () => {
            checkLoginState();
        };
        
        // Also listen for custom logout events
        const handleLogoutEvent = () => {
            setUser(null);
            setIsAuthenticated(false);
        };

        // Listen for custom login events
        const handleLoginEvent = () => {
            const mockUser = {
                id: 'user_123',
                email: 'student@qcu.edu.ph',
                name: 'John Doe',
                picture: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
            };
            setUser(mockUser);
            setIsAuthenticated(true);
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedOut', handleLogoutEvent);
        window.addEventListener('userLoggedIn', handleLoginEvent);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedOut', handleLogoutEvent);
            window.removeEventListener('userLoggedIn', handleLoginEvent);
        };
    }, []);

    const stations = [
        { id: 'QCU-001', name: 'Main Library', location: '1st Floor, Main Entrance' },
        { id: 'QCU-002', name: 'Student Center', location: 'Food Court Area' },
        { id: 'QCU-003', name: 'Engineering Building', location: 'Lobby' },
        { id: 'QCU-004', name: 'Sports Complex', location: 'Main Entrance' }
    ];

    const problemTypes = [
        'Charging port not working',
        'Payment system error',
        'RFID reader not responding',
        'Physical damage to station',
        'Screen/display issues',
        'Overheating problems',
        'Station completely offline',
        'Other technical issue'
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low - Minor inconvenience', color: 'green' },
        { value: 'medium', label: 'Medium - Affecting usage', color: 'yellow' },
        { value: 'high', label: 'High - Station unusable', color: 'red' },
        { value: 'critical', label: 'Critical - Safety concern', color: 'red-dark' }
    ];


    const handleGoogleLoginClick = () => {
        openModal(() => {
            const mockUser = {
                id: 'user_123',
                email: 'student@qcu.edu.ph',
                name: 'John Doe',
                picture: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
            };
            setUser(mockUser);
            setIsAuthenticated(true);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showError('Please log in to report a problem');
            return;
        }

        if (!formData.station || !formData.problemType || !formData.description || !formData.urgency) {
            showError('Please fill in all required fields');
            return;
        }
        
        // Mock form submission
        showSuccess('Problem report submitted successfully! We\'ll investigate this issue promptly.');
        setFormData({ station: '', problemType: '', description: '', urgency: '' });
    };

    const recentReports = [
        {
            id: 'RPT-001',
            station: 'QCU-002',
            stationName: 'Student Center',
            issue: 'Charging port not working',
            status: 'resolved',
            reportedBy: 'Anonymous User',
            date: '2 hours ago'
        },
        {
            id: 'RPT-002',
            station: 'QCU-001',
            stationName: 'Main Library',
            issue: 'RFID reader not responding',
            status: 'investigating',
            reportedBy: 'Sarah M.',
            date: '1 day ago'
        },
        {
            id: 'RPT-003',
            station: 'QCU-004',
            stationName: 'Sports Complex',
            issue: 'Screen display issues',
            status: 'scheduled',
            reportedBy: 'Mike L.',
            date: '2 days ago'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'status-resolved';
            case 'investigating': return 'status-investigating';
            case 'scheduled': return 'status-scheduled';
            default: return 'status-default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': 
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <path d="M22 4 12 14.01l-3-3"></path>
                    </svg>
                );
            case 'investigating': 
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                );
            case 'scheduled': 
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
            default: 
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
        }
    };

    return (
        <div id="report-problem-page">
            <div className="container">
                {/* Header */}
                <div className="header">
                    <span className="badge-red">Report an Issue</span>
                    <h1>Report a Problem</h1>
                    <p className="subtitle">
                        Encountered an issue with one of our EcoCharge stations? Let us know so we can 
                        fix it quickly and keep our network running smoothly for everyone.
                    </p>
                </div>

                <div className="main-grid">
                    {/* Report Form */}
                    <div className="form-section">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    Submit Problem Report
                                </h3>
                                <p className="card-description">
                                    Please provide as much detail as possible to help us resolve the issue quickly.
                                </p>
                            </div>
                            <div className="card-content">
                                {!isAuthenticated ? (
                                    <div className="login-prompt">
                                        <p className="login-text">Please log in to report a problem</p>
                                        <button onClick={handleGoogleLoginClick} className="google-login-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            Login
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="user-info">
                                            <img 
                                                src={user?.picture || 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'} 
                                                alt={user?.name}
                                                className="user-avatar"
                                            />
                                            <div className="user-details">
                                                <p className="user-name">{user?.name}</p>
                                                <p className="user-email">{user?.email}</p>
                                            </div>
                                        </div>
                                        
                                        <form onSubmit={handleSubmit} className="report-form">
                                            <div className="form-group">
                                                <label htmlFor="station" className="form-label">
                                                    Station Location *
                                                </label>
                                                <select 
                                                    id="station"
                                                    value={formData.station} 
                                                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value="">Select the station with the problem</option>
                                                    {stations.map((station) => (
                                                        <option key={station.id} value={station.id}>
                                                            {station.name} ({station.id}) - {station.location}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="problemType" className="form-label">
                                                    Problem Type *
                                                </label>
                                                <select 
                                                    id="problemType"
                                                    value={formData.problemType} 
                                                    onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value="">What type of problem are you experiencing?</option>
                                                    {problemTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="urgency" className="form-label">
                                                    Urgency Level *
                                                </label>
                                                <select 
                                                    id="urgency"
                                                    value={formData.urgency} 
                                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value="">How urgent is this issue?</option>
                                                    {urgencyLevels.map((level) => (
                                                        <option key={level.value} value={level.value}>
                                                            {level.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label htmlFor="description" className="form-label">
                                                    Problem Description *
                                                </label>
                                                <textarea
                                                    id="description"
                                                    placeholder="Please describe the problem in detail. Include what you were trying to do, what happened, and any error messages you saw..."
                                                    className="form-textarea"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            
                                            <button type="submit" className="submit-button">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                                Submit Problem Report
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports & Info */}
                    <div className="info-section">
                        {/* Response Time Info */}
                        <div className="card response-card">
                            <div className="card-header">
                                <h3 className="card-title">Our Response Promise</h3>
                            </div>
                            <div className="card-content">
                                <div className="response-times">
                                    <div className="response-item">
                                        <div className="response-badge critical">1h</div>
                                        <span>Critical issues: Within 1 hour</span>
                                    </div>
                                    <div className="response-item">
                                        <div className="response-badge high">4h</div>
                                        <span>High priority: Within 4 hours</span>
                                    </div>
                                    <div className="response-item">
                                        <div className="response-badge normal">24h</div>
                                        <span>Other issues: Within 24 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reports */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Problem Reports</h3>
                                <p className="card-description">
                                    Track the status of recently reported issues
                                </p>
                            </div>
                            <div className="card-content">
                                <div className="reports-list">
                                    {recentReports.map((report) => (
                                        <div key={report.id} className="report-item">
                                            <div className="report-header">
                                                <div className="report-info">
                                                    <div className="report-issue">{report.issue}</div>
                                                    <div className="report-location">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                        <span>{report.stationName} ({report.station})</span>
                                                    </div>
                                                </div>
                                                <div className={`status-badge ${getStatusColor(report.status)}`}>
                                                    <div className="status-content">
                                                        {getStatusIcon(report.status)}
                                                        <span className="status-text">{report.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="report-meta">
                                                Reported by {report.reportedBy} • {report.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="card emergency-card">
                            <div className="card-header">
                                <h3 className="card-title emergency-title">Emergency Contact</h3>
                                <p className="card-description">
                                    For urgent safety concerns or emergencies
                                </p>
                            </div>
                            <div className="card-content">
                                <div className="emergency-info">
                                    <p className="emergency-text">
                                        Campus Security: <span className="emergency-number">+63 (2) 8806-3549</span>
                                    </p>
                                    <p className="emergency-note">Available 24/7 for emergency situations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ReportProblem;
