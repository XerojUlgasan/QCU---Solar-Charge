import React from 'react';
import "../styles/Overview.css";

function Overview() {
    const stations = [
        {
            id: "QCU-001",
            name: "Main Library",
            status: "active",
            usage: 85,
            location: "1st Floor, Main Entrance"
        },
        {
            id: "QCU-002", 
            name: "Student Center",
            status: "active",
            usage: 72,
            location: "Food Court Area"
        },
        {
            id: "QCU-003",
            name: "Engineering Building",
            status: "maintenance",
            usage: 0,
            location: "Lobby"
        },
        {
            id: "QCU-004",
            name: "Sports Complex",
            status: "active",
            usage: 45,
            location: "Main Entrance"
        }
    ];

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'maintenance': return 'bg-yellow-500';
            case 'offline': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'maintenance': return 'Maintenance';
            case 'offline': return 'Offline';
            default: return 'Unknown';
        }
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
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#22c55e'}}>4</div>
                        <div className="stat-label">Active Stations</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#3b82f6'}}>67%</div>
                        <div className="stat-label">Average Usage</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#f59e0b'}}>12.5kW</div>
                        <div className="stat-label">Total Power</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#8b5cf6'}}>156</div>
                        <div className="stat-label">Daily Users</div>
                    </div>
                </div>

                {/* Station Status */}
                <div>
                    <h2 className="section-header">Station Status</h2>
                    <div className="stations-grid">
                        {stations.map((station, index) => (
                            <div key={index} className="station-card">
                                <div className="station-header">
                                    <div className="station-info">
                                        <h3>{station.name}
                                            <div className={`status-dot ${station.status}`}></div>
                                        </h3>
                                        <div className="station-location">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <span>{station.location}</span>
                                        </div>
                                    </div>
                                    <span className="station-id">{station.id}</span>
                                </div>
                                <div className="station-details">
                                    <div className="detail-row">
                                        <span className="label">Status</span>
                                        <span className="value">{getStatusText(station.status)}</span>
                                    </div>
                                    <div className="usage-container">
                                        <div className="detail-row">
                                            <span className="label">Usage</span>
                                            <span className="value">{station.usage}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{width: `${station.usage}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="last-updated">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 6v6l4 2"></path>
                                        </svg>
                                        <span>Last updated: 2 min ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
        </div>
    );
}

export default Overview;
