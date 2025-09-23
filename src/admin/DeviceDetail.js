import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Users
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import '../styles/DeviceDetail.css';

const DeviceDetail = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const { authenticatedAdminFetch } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');
  const [timeFilter, setTimeFilter] = useState('daily');
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch device data from API
  const fetchDeviceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Find the specific device by ID
      const devices = data.devices || [];
      const foundDevice = devices.find(d => d.id === deviceId);
      
      if (!foundDevice) {
        throw new Error(`Device ${deviceId} not found`);
      }

      // Map API data to device structure
      const mappedDevice = {
        id: foundDevice.id,
        name: foundDevice.name || 'Unknown Device',
        location: foundDevice.location || 'Unknown Location',
        building: foundDevice.building || 'Unknown Building',
        status: foundDevice.status || 'unknown',
        installDate: "2024-01-15", // Not in API yet
        lastMaintenance: "2024-12-01", // Not in API yet
        
        // Real-time metrics from API
        voltage: `${foundDevice.volt || 0}V`,
        current: `${foundDevice.current || 0}A`,
        power: formatPower(foundDevice.power || 0),
        energy: `${(foundDevice.energy || 0).toFixed(1)}kWh`,
        temperature: `${foundDevice.temperature || 0}°C`,
        batteryLevel: foundDevice.percentage || 0,
        
        // Usage data (mock for now)
        usage: foundDevice.percentage || 0,
        sessionsToday: 23, // Mock data
        revenue: "₱2,340", // Mock data
        freeHours: 45, // Mock data
        
        // Performance (mock for now)
        uptime: 99.2,
        efficiency: 94.8,
        errorRate: 0.8
      };

      setDevice(mappedDevice);
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError(err.message);
      // Set fallback device data
      setDevice({
        id: deviceId || "QCU-001",
        name: "Device Not Found",
        location: "Unknown Location",
        building: "Unknown Building",
        status: "offline",
        installDate: "2024-01-15",
        lastMaintenance: "2024-12-01",
        voltage: "0V",
        current: "0A",
        power: "0W",
        energy: "0kWh",
        temperature: "0°C",
        batteryLevel: 0,
        usage: 0,
        sessionsToday: 0,
        revenue: "₱0",
        freeHours: 0,
        uptime: 0,
        efficiency: 0,
        errorRate: 0
      });
    } finally {
      setLoading(false);
    }
  }, [deviceId, authenticatedAdminFetch]);

  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  // Utility function to format power
  const formatPower = (power) => {
    if (power >= 1000) {
      return `${(power / 1000).toFixed(1)}kW`;
    }
    return `${power.toFixed(1)}W`;
  };

  // Get time-filtered data
  const getTimeFilteredData = (timeFilter) => {
    const baseData = {
      energy: device?.energy || "0kWh",
      revenue: device?.revenue || "₱0",
      uses: device?.sessionsToday || 0,
      sessions: device?.sessionsToday || 0
    };

    // Mock time-filtered data (in real app, this would come from API)
    const timeFilteredData = {
      daily: {
        energy: baseData.energy,
        revenue: baseData.revenue,
        uses: baseData.uses,
        sessions: baseData.sessions
      },
      weekly: {
        energy: `${(parseFloat(baseData.energy) * 7).toFixed(1)}kWh`,
        revenue: `₱${(parseInt(baseData.revenue.replace(/[₱,]/g, '')) * 7).toLocaleString()}`,
        uses: baseData.uses * 7,
        sessions: baseData.sessions * 7
      },
      monthly: {
        energy: `${(parseFloat(baseData.energy) * 30).toFixed(1)}kWh`,
        revenue: `₱${(parseInt(baseData.revenue.replace(/[₱,]/g, '')) * 30).toLocaleString()}`,
        uses: baseData.uses * 30,
        sessions: baseData.sessions * 30
      },
      total: {
        energy: `${(parseFloat(baseData.energy) * 365).toFixed(1)}kWh`,
        revenue: `₱${(parseInt(baseData.revenue.replace(/[₱,]/g, '')) * 365).toLocaleString()}`,
        uses: baseData.uses * 365,
        sessions: baseData.sessions * 365
      }
    };

    return timeFilteredData[timeFilter] || timeFilteredData.daily;
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
    fetchDeviceData().finally(() => {
      setIsRefreshing(false);
    });
  };

  if (loading) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Loading Device..."
          navigate={handleNavigation}
        />
        <div className="device-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading device data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Device Error"
          navigate={handleNavigation}
        />
        <div className="device-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchDeviceData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeFilteredData = getTimeFilteredData(timeFilter);

  return (
    <div id="device-detail">
      <AdminHeader 
        title={`Device ${device.id} - ${device.name}`}
        navigate={handleNavigation}
      />
      
      <div className="device-content">
        {/* Header with back button and time filter */}
        <div className="header-section">
          <button
            className="back-button"
            onClick={() => handleNavigation('admin-devices')}
          >
            <ArrowLeft className="back-icon" />
            <span>Back to Devices</span>
          </button>
          
          <div className="header-controls">
            <div className="time-filter-group">
              <span className="time-filter-label">Time Period:</span>
              <select 
                className="time-filter-select"
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="total">Total</option>
              </select>
            </div>
            
            <button 
              className="refresh-button"
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
              Refresh
            </button>
          </div>
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
                <div className="metric-value metric-blue">{timeFilteredData.energy}</div>
                <div className="metric-label">Energy Generated</div>
              </div>
              <div className="metric-card">
                <div className="metric-value metric-green">{timeFilteredData.revenue}</div>
                <div className="metric-label">Revenue</div>
              </div>
              <div className="metric-card">
                <div className="metric-value metric-purple">{timeFilteredData.uses}</div>
                <div className="metric-label">Uses</div>
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
                      <div className="power-fill" style={{width: `${Math.min((device.batteryLevel || 0), 100)}%`}}></div>
                    </div>
                    <div className="power-text">{device.batteryLevel}% of maximum capacity</div>
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
                      <div className="energy-value">{timeFilteredData.energy}</div>
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
                      <div className="usage-value">{timeFilteredData.sessions}</div>
                      <div className="usage-label">Sessions</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">{timeFilteredData.energy}</div>
                      <div className="usage-label">Energy</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">{timeFilteredData.uses}</div>
                      <div className="usage-label">Uses</div>
                    </div>
                    <div className="usage-item">
                      <div className="usage-value">{timeFilteredData.revenue}</div>
                      <div className="usage-label">Revenue</div>
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