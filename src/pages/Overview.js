import React, { useState, useEffect } from 'react';
import "../styles/Overview.css";

function Overview() {
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
        <div id="overview-page">
            <div className="container">
                {/* Header */}
                <div className="header">
                    <span className="badge-blue">System Overview</span>
                    <h1>QCU EcoCharge Network</h1>
                    <p className="subtitle">
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
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#22c55e'}}>
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
                        <div className="stat-label">Active Stations</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#f59e0b'}}>{formatPower(overviewData.total_power)}</div>
                        <div className="stat-label">Total Power</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#8b5cf6'}}>{overviewData.transactions_today}</div>
                        <div className="stat-label">Transactions Today</div>
                    </div>
                </div>
                )}

                {/* Station Status */}
                <div id="station-status">
                    <div className="section-header-container">
                        <h2 className="section-header">Station Status</h2>
                        {!loading && !error && overviewData.devices.length > 0 && (
                            <button 
                                className="view-all-button"
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
                            <div key={index} className="station-card">
                                <div className="station-header">
                                    <div className="station-info">
                                        <h3>{device.name || 'Unknown Device'}
                                            <div className={`status-dot ${(device.status || 'offline').toLowerCase()}`}></div>
                                        </h3>
                                        <div className="station-location">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <span>{device.location || 'Unknown Location'}</span>
                                        </div>
                                    </div>
                                    <span className="station-id">{device.id || 'N/A'}</span>
                                </div>
                                <div className="station-details">
                                    <div className="detail-row">
                                        <span className="label">Status</span>
                                        <span className="value">{getStatusText(device.status)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Power</span>
                                        <span className="value">{formatPower(device.power)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Temperature</span>
                                        <span className="value">{device.temperature || 'N/A'}°C</span>
                                    </div>
                                    <div className="usage-container">
                                        <div className="detail-row">
                                            <span className="label">Battery Percentage</span>
                                            <span className="value">{device.percentage || 0}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{width: `${device.percentage || 0}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="last-updated">
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
                    <h2 className="section-header center">System Features</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-header">
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                </div>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="tech-specs">
                    <h2>Technical Specifications</h2>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <h3>Solar Panel Capacity</h3>
                            <p className="spec-value green">400W</p>
                            <p className="spec-description">Per station</p>
                        </div>
                        <div className="spec-item">
                            <h3>Battery Storage</h3>
                            <p className="spec-value blue">2.5kWh</p>
                            <p className="spec-description">Lithium-ion</p>
                        </div>
                        <div className="spec-item">
                            <h3>Charging Ports</h3>
                            <p className="spec-value purple">6</p>
                            <p className="spec-description">USB-A, USB-C, Wireless</p>
                        </div>
                        <div className="spec-item">
                            <h3>Operating Hours</h3>
                            <p className="spec-value yellow">24/7</p>
                            <p className="spec-description">All year round</p>
                        </div>
                        <div className="spec-item">
                            <h3>Connectivity</h3>
                            <p className="spec-value red">4G/WiFi</p>
                            <p className="spec-description">IoT monitoring</p>
                        </div>
                        <div className="spec-item">
                            <h3>Weather Rating</h3>
                            <p className="spec-value indigo">IP65</p>
                            <p className="spec-description">Weatherproof</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Stations Modal */}
            {showAllStations && (
                <div className="modal-overlay" onClick={() => setShowAllStations(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>All Stations ({getFilteredDevices().length})</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #1e2633',
                                        backgroundColor: '#0f141c',
                                        color: '#eaecef',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowAllStations(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="stations-grid-modal">
                                {getFilteredDevices().map((device, index) => (
                                    <div key={index} className="station-card">
                                        <div className="station-header">
                                            <div className="station-info">
                                                <h3>{device.name || 'Unknown Device'}
                                                    <div className={`status-dot ${(device.status || 'offline').toLowerCase()}`}></div>
                                                </h3>
                                                <div className="station-location">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span>{device.location || 'Unknown Location'}</span>
                                                </div>
                                            </div>
                                            <span className="station-id">{device.id || 'N/A'}</span>
                                        </div>
                                        <div className="station-details">
                                            <div className="detail-row">
                                                <span className="label">Status</span>
                                                <span className="value">{getStatusText(device.status)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Power</span>
                                                <span className="value">{formatPower(device.power)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Temperature</span>
                                                <span className="value">{device.temperature || 'N/A'}°C</span>
                                            </div>
                                            <div className="usage-container">
                                                <div className="detail-row">
                                                    <span className="label">Battery Percentage</span>
                                                    <span className="value">{device.percentage || 0}%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{width: `${device.percentage || 0}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="last-updated">
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
