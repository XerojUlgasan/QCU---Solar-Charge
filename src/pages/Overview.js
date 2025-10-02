import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import "../styles/Overview.css";

function Overview() {
    const { isDarkMode } = useTheme();
    
    const [overviewData, setOverviewData] = useState({
        active: 0,
        total_power: 0,
        transactions_today: 0,
        devices: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAllStations, setShowAllStations] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOverviewData();
    }, []);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://api-qcusolarcharge.up.railway.app/overview/getoverview');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.overview) {
                setOverviewData(data.overview);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching overview data:', error);
            setError('Failed to load overview data');
        } finally {
            setLoading(false);
        }
    };

    const formatPower = (power) => {
        // Handle null, undefined, or non-numeric values
        if (power === null || power === undefined || isNaN(power)) {
            return '0W';
        }
        
        const numericPower = Number(power);
        if (numericPower >= 1000) {
            return `${(numericPower / 1000).toFixed(1)}kW`;
        }
        return `${numericPower.toFixed(1)}W`;
    };

    const formatLastUpdated = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Unknown';
        }
        
        const now = new Date();
        const lastUpdated = new Date(timestamp.seconds * 1000);
        const diffInSeconds = Math.floor((now - lastUpdated) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
            ),
            title: "Solar Powered",
            description: "100% renewable energy from integrated solar panels"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect width="16" height="10" x="2" y="7" rx="2" ry="2"></rect>
                    <path d="M6 17v4"></path>
                    <path d="M10 17v4"></path>
                    <path d="M14 17v4"></path>
                    <path d="M18 17v4"></path>
                    <path d="M20 11H4"></path>
                </svg>
            ),
            title: "Energy Storage",
            description: "Advanced battery systems for 24/7 availability"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M5 12a7 7 0 0 1 14 0"></path>
                    <path d="M12 1v6"></path>
                    <path d="M12 17v6"></path>
                    <path d="M4.22 4.22l4.24 4.24"></path>
                    <path d="M15.54 15.54l4.24 4.24"></path>
                    <path d="M1 12h6"></path>
                    <path d="M17 12h6"></path>
                    <path d="M4.22 19.78l4.24-4.24"></path>
                    <path d="M15.54 8.46l4.24-4.24"></path>
                </svg>
            ),
            title: "Smart Monitoring",
            description: "IoT-enabled real-time status and usage tracking"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
            ),
            title: "RFID Security",
            description: "Secure access with student RFID cards"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <path d="M2 10h20"></path>
                </svg>
            ),
            title: "Flexible Payment",
            description: "Pay per use or enjoy free RFID hours"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                </svg>
            ),
            title: "Multi-Device",
            description: "Supports various device types and charging standards"
        }
    ];

    const getStatusText = (status) => {
        // Normalize status to lowercase for comparison
        const normalizedStatus = status?.toLowerCase();
        switch (normalizedStatus) {
            case 'active': return 'Active';
            case 'maintenance': return 'Maintenance';
            case 'offline': return 'Offline';
            case 'inactive': return 'Inactive';
            default: return 'Unknown';
        }
    };

    const getFilteredDevices = () => {
        if (statusFilter === 'all') {
            return overviewData.devices;
        }
        
        return overviewData.devices.filter(device => {
            const status = device.status?.toLowerCase();
            switch (statusFilter) {
                case 'active':
                    return status === 'active' || 
                           status === 'online' || 
                           status === 'running' || 
                           status === 'operational' ||
                           status === 'connected' ||
                           (status && !['offline', 'inactive', 'maintenance', 'error', 'failed', 'disconnected'].includes(status));
                case 'inactive':
                    return status === 'inactive' || status === 'offline' || status === 'error' || status === 'failed' || status === 'disconnected';
                case 'maintenance':
                    return status === 'maintenance';
                default:
                    return true;
            }
        });
    };

    return (
        <div id="overview-page" className={isDarkMode ? '' : 'light'}>
            <div className="container">
                {/* Header */}
                <div className="header">
                    <span className={`badge-blue ${isDarkMode ? '' : 'light'}`} style={{
                        backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe',
                        color: isDarkMode ? '#ffffff' : '#1e40af'
                    }}>
                        System Overview
                    </span>
                    <h1 className={isDarkMode ? 'text-white' : 'text-gray-900'}>QCU EcoCharge Network</h1>
                    <p className="subtitle" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                        Monitor the real-time status of our solar-powered charging stations across campus. 
                        Each station is equipped with advanced monitoring and energy management systems.
                    </p>
                </div>

                {/* Network Stats */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading overview data...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button className="retry-button" onClick={fetchOverviewData}>
                            Retry
                        </button>
                    </div>
                ) : (
                <div className="stats-grid">
                    <div className={`stat-card ${isDarkMode ? '' : 'light'}`} style={{
                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                    }}>
                        <div className="stat-value" style={{color: isDarkMode ? '#22c55e' : '#10b981'}}>
                            {overviewData.devices.filter(device => {
                                const status = device.status?.toLowerCase();
                                return status === 'active' || 
                                       status === 'online' || 
                                       status === 'running' || 
                                       status === 'operational' ||
                                       status === 'connected' ||
                                       (status && !['offline', 'inactive', 'maintenance', 'error', 'failed', 'disconnected'].includes(status));
                            }).length}
                        </div>
                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Active Stations</div>
                    </div>
                    <div className={`stat-card ${isDarkMode ? '' : 'light'}`} style={{
                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                    }}>
                        <div className="stat-value" style={{color: isDarkMode ? '#f59e0b' : '#f59e0b'}}>{formatPower(overviewData.total_power)}</div>
                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Total Power</div>
                    </div>
                    <div className={`stat-card ${isDarkMode ? '' : 'light'}`} style={{
                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                    }}>
                        <div className="stat-value" style={{color: isDarkMode ? '#8b5cf6' : '#8b5cf6'}}>{overviewData.transactions_today}</div>
                        <div className="stat-label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Transactions Today</div>
                    </div>
                </div>
                )}

                {/* Station Status */}
                <div id="station-status">
                    <div className="section-header-container">
                        <h2 className={`section-header ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Station Status</h2>
                        {!loading && !error && overviewData.devices.length > 0 && (
                            <button 
                                className={`view-all-button ${isDarkMode ? '' : 'light'}`}
                                style={{
                                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                                    color: isDarkMode ? '#eaecef' : '#374151'
                                }}
                                onClick={() => setShowAllStations(true)}
                            >
                                View All ({overviewData.devices.length})
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading station data...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <p className="error-message">{error}</p>
                            <button className="retry-button" onClick={fetchOverviewData}>
                                Retry
                            </button>
                        </div>
                    ) : (
                    <div className="stations-grid">
                        {overviewData.devices.slice(0, 3).map((device, index) => (
                            <div key={index} className={`station-card ${isDarkMode ? '' : 'light'}`} style={{
                                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                            }}>
                                <div className="station-header">
                                    <div className="station-info">
                                        <h3>{device.name || 'Unknown Device'}
                                            <div className={`status-dot ${(device.status || 'offline').toLowerCase()}`}></div>
                                        </h3>
                                        <div className="station-location" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <span>{device.location || 'Unknown Location'}</span>
                                        </div>
                                    </div>
                                    <span className="station-id" style={{
                                        backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                                        color: isDarkMode ? '#9aa3b2' : '#374151'
                                    }}>{device.id || 'N/A'}</span>
                                </div>
                                <div className="station-details">
                                    <div className="detail-row">
                                        <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Status</span>
                                        <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937'}}>{getStatusText(device.status)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Power</span>
                                        <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937'}}>{formatPower(device.power)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Temperature</span>
                                        <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937'}}>{device.temperature || 'N/A'}°C</span>
                                    </div>
                                    <div className="usage-container">
                                        <div className="detail-row">
                                            <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Battery Percentage</span>
                                            <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937'}}>{device.percentage || 0}%</span>
                                        </div>
                                        <div className="progress-bar" style={{
                                            backgroundColor: isDarkMode ? '#1e2633' : '#e5e7eb'
                                        }}>
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${device.percentage || 0}%`,
                                                    background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #10b981, #3b82f6)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="last-updated" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 6v6l4 2"></path>
                                        </svg>
                                        <span>Last updated: {formatLastUpdated(device.last_updated)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* System Features */}
                <div>
                    <h2 className={`section-header center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Features</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className={`feature-card ${isDarkMode ? '' : 'light'}`} style={{
                                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                            }}>
                                <div className="feature-header">
                                    <div className="feature-icon" style={{
                                        background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #10b981, #3b82f6)'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 className={`feature-title ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                </div>
                                <p className="feature-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className={`tech-specs ${isDarkMode ? '' : 'light'}`} style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
                }}>
                    <h2 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Technical Specifications</h2>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Solar Panel Capacity</h3>
                            <p className={`spec-value ${isDarkMode ? 'green' : 'green'}`} style={{color: isDarkMode ? '#22c55e' : '#22c55e'}}>400W</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Per station</p>
                        </div>
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Battery Storage</h3>
                            <p className={`spec-value ${isDarkMode ? 'blue' : 'blue'}`} style={{color: isDarkMode ? '#3b82f6' : '#3b82f6'}}>2.5kWh</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Lithium-ion</p>
                        </div>
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Charging Ports</h3>
                            <p className={`spec-value ${isDarkMode ? 'purple' : 'purple'}`} style={{color: isDarkMode ? '#8b5cf6' : '#8b5cf6'}}>6</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>USB-A, USB-C, Wireless</p>
                        </div>
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Operating Hours</h3>
                            <p className={`spec-value ${isDarkMode ? 'yellow' : 'yellow'}`} style={{color: isDarkMode ? '#f59e0b' : '#f59e0b'}}>24/7</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>All year round</p>
                        </div>
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Connectivity</h3>
                            <p className={`spec-value ${isDarkMode ? 'red' : 'red'}`} style={{color: isDarkMode ? '#ef4444' : '#ef4444'}}>4G/WiFi</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>IoT monitoring</p>
                        </div>
                        <div className="spec-item">
                            <h3 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Weather Rating</h3>
                            <p className={`spec-value ${isDarkMode ? 'indigo' : 'indigo'}`} style={{color: isDarkMode ? '#6366f1' : '#6366f1'}}>IP65</p>
                            <p className="spec-description" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Weatherproof</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Stations Modal - Fixed Close Button */}
            {showAllStations && (
                <div 
                    className="stations-modal-backdrop" 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                        animation: 'fadeInModal 0.3s ease-out'
                    }}
                    onClick={() => setShowAllStations(false)}
                >
                    <div 
                        className="stations-modal-container" 
                        style={{
                            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                            borderRadius: '16px',
                            maxWidth: '1200px',
                            width: '95vw',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideInModal 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Compact Single Row */}
                        <div 
                            className="stations-modal-top-header" 
                            style={{
                                padding: '12px 20px',
                                borderBottom: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb',
                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                                minHeight: '50px'
                            }}
                        >
                            {/* Left Section - Title */}
                            <div style={{ flex: '1', minWidth: '150px' }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: isDarkMode ? '#eaecef' : '#1f2937',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    All Stations
                                    <span style={{
                                        fontSize: '12px',
                                        color: isDarkMode ? '#9aa3b2' : '#6b7280',
                                        fontWeight: '500',
                                        backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                                        padding: '2px 6px',
                                        borderRadius: '8px'
                                    }}>
                                        ({getFilteredDevices().length})
                                    </span>
                                </h2>
                            </div>

                            {/* Right Section - Controls */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                {/* Filter Dropdown */}
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        border: isDarkMode ? '1px solid #1e2633' : '1px solid #d1d5db',
                                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                        color: isDarkMode ? '#eaecef' : '#374151',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        minWidth: '100px'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = isDarkMode ? '#1e2633' : '#d1d5db';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>

                                {/* Close Button - Fixed */}
                                <button 
                                    className="modal-close-button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 10px',
                                        backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                                        border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        color: isDarkMode ? '#9aa3b2' : '#6b7280',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        msUserSelect: 'none'
                                    }}
                                    onClick={() => setShowAllStations(false)}
                                    onMouseEnter={(e) => {
                                        const button = e.currentTarget;
                                        button.style.backgroundColor = isDarkMode ? '#374151' : '#e5e7eb';
                                        button.style.color = isDarkMode ? '#eaecef' : '#1f2937';
                                        button.style.borderColor = isDarkMode ? '#4b5563' : '#9ca3af';
                                        button.style.transform = 'translateY(-1px)';
                                        button.style.boxShadow = isDarkMode 
                                            ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        const button = e.currentTarget;
                                        button.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                                        button.style.color = isDarkMode ? '#9aa3b2' : '#6b7280';
                                        button.style.borderColor = isDarkMode ? '#374151' : '#d1d5db';
                                        button.style.transform = 'translateY(0)';
                                        button.style.boxShadow = 'none';
                                    }}
                                    onMouseDown={(e) => {
                                        const button = e.currentTarget;
                                        button.style.transform = 'translateY(0) scale(0.98)';
                                    }}
                                    onMouseUp={(e) => {
                                        const button = e.currentTarget;
                                        button.style.transform = 'translateY(-1px) scale(1)';
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    <span>Close</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div 
                            className="stations-modal-content" 
                            style={{
                                padding: '16px 20px 20px 20px',
                                overflowY: 'auto',
                                flex: 1,
                                scrollbarWidth: 'thin',
                                scrollbarColor: isDarkMode ? '#374151 #1e2633' : '#d1d5db #f3f4f6'
                            }}
                        >
                            <div 
                                className="stations-grid-modal-new" 
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '16px',
                                    maxWidth: '100%'
                                }}
                            >
                                {getFilteredDevices().map((device, index) => (
                                    <div 
                                        key={index} 
                                        className={`station-card-new ${isDarkMode ? '' : 'light'}`} 
                                        style={{
                                        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                                            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = isDarkMode 
                                                ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
                                                : '0 8px 25px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div className="station-header">
                                            <div className="station-info">
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    margin: '0 0 4px 0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: isDarkMode ? '#eaecef' : '#1f2937'
                                                }}>
                                                    {device.name || 'Unknown Device'}
                                                    <div className={`status-dot ${(device.status || 'offline').toLowerCase()}`}></div>
                                                </h3>
                                                <div className="station-location" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: isDarkMode ? '#9aa3b2' : '#374151',
                                                    fontSize: '13px'
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span>{device.location || 'Unknown Location'}</span>
                                                </div>
                                            </div>
                                            <span className="station-id" style={{
                                                padding: '3px 6px',
                                                borderRadius: '4px',
                                                background: isDarkMode ? '#1e2633' : '#f3f4f6',
                                                color: isDarkMode ? '#9aa3b2' : '#374151',
                                                fontSize: '11px'
                                            }}>
                                                {device.id || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="station-details">
                                            <div className="detail-row" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '13px',
                                                marginBottom: '8px'
                                            }}>
                                                <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Status</span>
                                                <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937', fontWeight: '500'}}>{getStatusText(device.status)}</span>
                                            </div>
                                            <div className="detail-row" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '13px',
                                                marginBottom: '8px'
                                            }}>
                                                <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Power</span>
                                                <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937', fontWeight: '500'}}>{formatPower(device.power)}</span>
                                            </div>
                                            <div className="detail-row" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '13px',
                                                marginBottom: '8px'
                                            }}>
                                                <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Temperature</span>
                                                <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937', fontWeight: '500'}}>{device.temperature || 'N/A'}°C</span>
                                            </div>
                                            <div className="usage-container" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}>
                                                <div className="detail-row" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    fontSize: '13px'
                                                }}>
                                                    <span className="label" style={{color: isDarkMode ? '#9aa3b2' : '#374151'}}>Battery Percentage</span>
                                                    <span className="value" style={{color: isDarkMode ? '#eaecef' : '#1f2937', fontWeight: '500'}}>{device.percentage || 0}%</span>
                                                </div>
                                                <div className="progress-bar" style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: isDarkMode ? '#1e2633' : '#e5e7eb',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{
                                                            width: `${device.percentage || 0}%`,
                                                            height: '100%',
                                                            background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s ease'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="last-updated" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                color: isDarkMode ? '#9aa3b2' : '#374151',
                                                fontSize: '12px'
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M12 6v6l4 2"></path>
                                                </svg>
                                                <span>Last updated: {formatLastUpdated(device.last_updated)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Overview;