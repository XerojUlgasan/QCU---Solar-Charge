import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  DollarSign, 
  Clock, 
  Activity, 
  Thermometer,
  Battery,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import '../styles/DeviceDetail.css';

const DeviceDetail = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');

  // Mock device data - in real app, this would be fetched based on deviceId
  const device = {
    id: deviceId || "QCU-001",
    name: "Main Library",
    location: "1st Floor, Main Entrance",
    building: "Library Building",
    status: "active",
    installDate: "2024-01-15",
    lastMaintenance: "2024-12-01",
    
    // Real-time metrics
    voltage: "24.2V",
    current: "13.3A", 
    power: "3.2kW",
    energy: "156.8kWh",
    temperature: "28°C",
    batteryLevel: 92,
    
    // Usage data
    usage: 85,
    sessionsToday: 23,
    revenue: "₱2,340",
    freeHours: 45,
    
    // Performance
    uptime: 99.2,
    efficiency: 94.8,
    errorRate: 0.8
  };

  const recentSessions = [
    {
      id: "S001",
      user: "student@qcu.edu.ph",
      startTime: "14:30",
      duration: "45 min",
      type: "payment",
      amount: "₱25.00",
      port: "USB-C"
    },
    {
      id: "S002", 
      user: "john.doe@qcu.edu.ph",
      startTime: "13:15",
      duration: "60 min",
      type: "rfid",
      amount: "Free",
      port: "Wireless"
    },
    {
      id: "S003",
      user: "sarah.kim@qcu.edu.ph", 
      startTime: "12:00",
      duration: "30 min",
      type: "payment",
      amount: "₱15.00",
      port: "USB-A"
    },
    {
      id: "S004",
      user: "mike.lee@qcu.edu.ph",
      startTime: "11:20",
      duration: "25 min", 
      type: "payment",
      amount: "₱12.50",
      port: "USB-C"
    }
  ];

  const alerts = [
    {
      id: "A001",
      type: "warning",
      message: "Temperature slightly elevated (28°C)",
      time: "10 min ago",
      severity: "low"
    },
    {
      id: "A002",
      type: "info",
      message: "Scheduled maintenance due in 7 days",
      time: "2 hours ago",
      severity: "medium"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      default: return 'status-unknown';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 alert-warning" />;
      case 'error': return <AlertTriangle className="w-4 h-4 alert-error" />;
      case 'info': return <CheckCircle className="w-4 h-4 alert-info" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleNavigation = (route, deviceId) => {
    switch (route) {
      case 'admin-dashboard':
        navigate('/admin/dashboard');
        break;
      case 'admin-devices':
        navigate('/admin/devices');
        break;
      case 'admin-problems':
        navigate('/admin/problems');
        break;
      case 'admin-device-detail':
        navigate(`/admin/device/${deviceId}`);
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Mock refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div id="device-detail">
      <AdminHeader 
        title={`Device ${device.id} - ${device.name}`}
        navigate={handleNavigation}
      />
      
      <div className="device-content">
        {/* Header with back button */}
        <div className="header-section">
          <button
            className="back-button"
            onClick={() => handleNavigation('admin-devices')}
          >
            <ArrowLeft className="back-icon" />
            <span>Back to Devices</span>
          </button>
          
          <button 
            className="refresh-button"
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Device Overview */}
        <div className="overview-card">
          <div className="overview-header">
            <div className="device-info">
              <div className="device-title">{device.name}</div>
              <div className="device-description">
                <MapPin className="location-icon" />
                <span>{device.location}</span>
                <span>•</span>
                <span>{device.building}</span>
              </div>
            </div>
            <div className="device-badges">
              <div className={`status-badge ${getStatusColor(device.status)}`}>
                {device.status}
              </div>
              <div className="device-id-badge">{device.id}</div>
            </div>
          </div>
          
          <div className="overview-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value metric-blue">{device.power}</div>
                <div className="metric-label">Current Power</div>
              </div>
              <div className="metric-card">
                <div className="metric-value metric-green">{device.revenue}</div>
                <div className="metric-label">Monthly Revenue</div>
              </div>
              <div className="metric-card">
                <div className="metric-value metric-purple">{device.sessionsToday}</div>
                <div className="metric-label">Sessions Today</div>
              </div>
              <div className="metric-card">
                <div className="metric-value metric-yellow">{device.uptime}%</div>
                <div className="metric-label">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs-list">
            <button 
              className={`tab-trigger ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
              Real-time
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              Maintenance
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Real-time Tab */}
          <div className={`tab-content ${activeTab === 'realtime' ? 'active' : ''}`}>
            <div className="tab-grid">
              {/* Technical Metrics */}
              <div className="detail-card">
                <div className="card-header">
                  <div className="card-title">
                    <Zap className="title-icon" />
                    <span>Electrical Parameters</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="electrical-grid">
                    <div className="electrical-item">
                      <div className="electrical-label">Voltage</div>
                      <div className="electrical-value">{device.voltage}</div>
                    </div>
                    <div className="electrical-item">
                      <div className="electrical-label">Current</div>
                      <div className="electrical-value">{device.current}</div>
                    </div>
                  </div>
                  
                  <div className="power-section">
                    <div className="power-label">Power Output</div>
                    <div className="power-value">{device.power}</div>
                    <div className="power-bar">
                      <div className="power-fill" style={{width: '75%'}}></div>
                    </div>
                    <div className="power-text">75% of maximum capacity (4.2kW)</div>
                  </div>

                  <div className="status-grid">
                    <div className="status-item">
                      <Thermometer className="status-icon status-orange" />
                      <div>
                        <div className="status-value">{device.temperature}</div>
                        <div className="status-label">Temperature</div>
                      </div>
                    </div>
                    <div className="status-item">
                      <Battery className="status-icon status-green" />
                      <div>
                        <div className="status-value">{device.batteryLevel}%</div>
                        <div className="status-label">Battery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="detail-card">
                <div className="card-header">
                  <div className="card-title">
                    <Activity className="title-icon" />
                    <span>System Status</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="system-metrics">
                    <div className="metric-row">
                      <span className="metric-label">System Efficiency</span>
                      <span className="metric-value system-healthy">{device.efficiency}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${device.efficiency}%`}}></div>
                    </div>
                    
                    <div className="metric-row">
                      <span className="metric-label">Error Rate</span>
                      <span className="metric-value system-healthy">{device.errorRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${device.errorRate}%`}}></div>
                    </div>
                    
                    <div className="metric-row">
                      <span className="metric-label">Usage Level</span>
                      <span className="metric-value">{device.usage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${device.usage}%`}}></div>
                    </div>
                  </div>

                  <div className="energy-stats">
                    <div className="energy-item">
                      <div className="energy-label">Energy Today</div>
                      <div className="energy-value">{device.energy}</div>
                    </div>
                    <div className="energy-item">
                      <div className="energy-label">Free Hours Used</div>
                      <div className="energy-value">{device.freeHours}h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="alerts-card">
                <div className="card-header">
                  <div className="card-title">
                    <AlertTriangle className="title-icon" />
                    <span>Active Alerts</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="alerts-list">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="alert-item">
                        {getAlertIcon(alert.type)}
                        <div className="alert-content">
                          <div className="alert-message">{alert.message}</div>
                          <div className="alert-time">{alert.time}</div>
                        </div>
                        <div className="alert-severity">
                          {alert.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sessions Tab */}
          <div className={`tab-content ${activeTab === 'sessions' ? 'active' : ''}`}>
            <div className="sessions-card">
              <div className="card-header">
                <div className="card-title">Recent Charging Sessions</div>
                <div className="card-description">Latest user sessions and transactions</div>
              </div>
              <div className="card-content">
                <div className="sessions-list">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-info">
                        <div className="session-icon">
                          {session.type === 'rfid' ? (
                            <Clock className="icon" />
                          ) : (
                            <DollarSign className="icon" />
                          )}
                        </div>
                        <div>
                          <div className="session-user">{session.user}</div>
                          <div className="session-details">
                            {session.startTime} • {session.duration} • {session.port}
                          </div>
                        </div>
                      </div>
                      <div className="session-amount">
                        <div className="amount-value">{session.amount}</div>
                        <div className={`amount-badge ${session.type === 'rfid' ? 'badge-rfid' : 'badge-payment'}`}>
                          {session.type === 'rfid' ? 'RFID' : 'Payment'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Tab */}
          <div className={`tab-content ${activeTab === 'maintenance' ? 'active' : ''}`}>
            <div className="maintenance-grid">
              <div className="maintenance-card">
                <div className="card-header">
                  <div className="card-title">Maintenance Schedule</div>
                </div>
                <div className="card-content">
                  <div className="maintenance-item">
                    <Calendar className="maintenance-icon" />
                    <div>
                      <div className="maintenance-title">Last Maintenance</div>
                      <div className="maintenance-date">{device.lastMaintenance}</div>
                    </div>
                    <div className="maintenance-badge completed">Completed</div>
                  </div>
                  
                  <div className="maintenance-item">
                    <Calendar className="maintenance-icon" />
                    <div>
                      <div className="maintenance-title">Next Maintenance</div>
                      <div className="maintenance-date">2024-12-22</div>
                    </div>
                    <div className="maintenance-badge scheduled">Scheduled</div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header">
                  <div className="card-title">Device Information</div>
                </div>
                <div className="card-content">
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Installation Date</span>
                      <span className="info-value">{device.installDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Firmware Version</span>
                      <span className="info-value">v2.4.1</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Hardware Version</span>
                      <span className="info-value">ECS-Gen2</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Serial Number</span>
                      <span className="info-value">EC240115001</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Tab */}
          <div className={`tab-content ${activeTab === 'analytics' ? 'active' : ''}`}>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-header">
                  <div className="card-title">Performance Trends</div>
                </div>
                <div className="card-content">
                  <div className="trends-list">
                    <div className="trend-item">
                      <span className="trend-label">Energy Generation</span>
                      <div className="trend-value">
                        <TrendingUp className="trend-icon trend-up" />
                        <span className="trend-text trend-up">+12.5%</span>
                      </div>
                    </div>
                    
                    <div className="trend-item">
                      <span className="trend-label">Usage Frequency</span>
                      <div className="trend-value">
                        <TrendingUp className="trend-icon trend-up" />
                        <span className="trend-text trend-up">+8.3%</span>
                      </div>
                    </div>
                    
                    <div className="trend-item">
                      <span className="trend-label">System Efficiency</span>
                      <div className="trend-value">
                        <TrendingDown className="trend-icon trend-down" />
                        <span className="trend-text trend-down">-2.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-header">
                  <div className="card-title">Usage Statistics</div>
                </div>
                <div className="card-content">
                  <div className="usage-grid">
                    <div className="usage-item">
                      <div className="usage-value">847</div>
                      <div className="usage-label">Total Sessions</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">324h</div>
                      <div className="usage-label">Total Hours</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">156</div>
                      <div className="usage-label">Unique Users</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">94%</div>
                      <div className="usage-label">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
