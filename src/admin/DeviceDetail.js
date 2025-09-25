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
import { useNotification } from '../contexts/NotificationContext';
import '../styles/DeviceDetail.css';

const DeviceDetail = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const { authenticatedAdminFetch } = useAdminAuth();
  const { showSuccess, showError } = useNotification();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');
  const [timeFilter, setTimeFilter] = useState('daily');
  const [deviceData, setDeviceData] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch device information from admin dashboard API
  const fetchDeviceInfo = useCallback(async () => {
    if (!deviceId) return;
    
    try {
      console.log('=== FETCHING DEVICE INFO FROM DASHBOARD ===');
      console.log('Device ID:', deviceId);
      
      // Fetch device info from admin dashboard API
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data:', data);
        
        // Find the specific device in the devices array
        const device = data.devices?.find(d => d.device_id === deviceId);
        if (device) {
          console.log('Found device info:', device);
          setDeviceInfo({
            name: device.name,
            location: device.location,
            building: device.building,
            status: device.status,
            percentage: device.percentage,
            temperature: device.temperature,
            volt: device.volt,
            current: device.current,
            power: device.power,
            energy: device.energy
          });
        } else {
          console.log('Device not found in dashboard data');
        }
      } else {
        console.log('Dashboard API not available, using fallback mapping');
      }
    } catch (err) {
      console.log('Device info fetch failed, using fallback mapping:', err.message);
    }
  }, [deviceId, authenticatedAdminFetch]);

  // Fetch device data from API
  const fetchDeviceData = useCallback(async () => {
    if (!deviceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING DEVICE DATA ===');
      console.log('Device ID:', deviceId);
      
      // Fetch both device data and device info in parallel
      const [dataResponse] = await Promise.all([
        authenticatedAdminFetch(`https://api-qcusolarcharge.up.railway.app/admin/devices?device_id=${deviceId}`),
        fetchDeviceInfo()
      ]);
      
      console.log('Device data response status:', dataResponse.status);
      console.log('Device data response ok:', dataResponse.ok);
      
      if (!dataResponse.ok) {
        throw new Error(`HTTP error! status: ${dataResponse.status}`);
      }
      
      const data = await dataResponse.json();
      console.log('Device data:', data);
      
      setDeviceData(data);
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError('Failed to load device data. Please try again later.');
      showError('Failed to load device data');
    } finally {
      setLoading(false);
    }
  }, [deviceId, authenticatedAdminFetch, showError, fetchDeviceInfo]);

  // Fetch data when component mounts or deviceId changes
  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  // Fetch device information from API or use a more comprehensive mapping
  const getDeviceInfo = (deviceId) => {
    // Try to get device info from fetched device info first (from dashboard API)
    if (deviceInfo) {
      return {
        name: deviceInfo.name || `Device ${deviceId}`,
        location: deviceInfo.location || "QCU Campus",
        building: deviceInfo.building || "Main Building",
        status: deviceInfo.status || "active"
      };
    }

    // Try to get device info from API data
    if (deviceData?.device_info) {
      return {
        name: deviceData.device_info.name || `Device ${deviceId}`,
        location: deviceData.device_info.location || "QCU Campus",
        building: deviceData.device_info.building || "Main Building",
        status: deviceData.device_info.status || "active"
      };
    }

    // Fallback to a comprehensive mapping - this should ideally come from a database or API
    // TODO: Create a proper device metadata API endpoint or database table
    const deviceMap = {
      "QCU-001": {
    name: "Main Library",
    location: "1st Floor, Main Entrance",
        building: "Library Building"
      },
      "QCU-002": {
        name: "Student Center",
        location: "Ground Floor, Lobby",
        building: "Student Center Building"
      },
      "QCU-003": {
        name: "Engineering Lab",
        location: "2nd Floor, Lab Area",
        building: "Engineering Building"
      },
      "QCU-004": {
        name: "Cafeteria",
        location: "Ground Floor, Food Court",
        building: "Cafeteria Building"
      },
      "QCU-005": {
        name: "Computer Lab",
        location: "3rd Floor, IT Center",
        building: "Technology Building"
      },
      "QCU-006": {
        name: "Gymnasium",
        location: "Ground Floor, Sports Complex",
        building: "Sports Building"
      },
      "QCU-007": {
        name: "Auditorium",
        location: "2nd Floor, Main Hall",
        building: "Administration Building"
      },
      "QCU-008": {
        name: "Research Lab",
        location: "3rd Floor, Research Wing",
        building: "Research Building"
      },
      "QCU-009": {
        name: "Parking Area",
        location: "Ground Floor, Parking Lot",
        building: "Parking Building"
      },
      "QCU-010": {
        name: "Medical Center",
        location: "1st Floor, Health Services",
        building: "Health Building"
      }
    };

    return deviceMap[deviceId] || {
      name: `Device ${deviceId}`,
      location: "QCU Campus",
      building: "Main Building",
      status: "active"
    };
  };

  // Format device data for display
  const getFormattedDeviceData = () => {
    if (!deviceData) {
      const deviceInfo = getDeviceInfo(deviceId);
      return {
        id: deviceId || "QCU-001",
        name: deviceInfo.name,
        location: deviceInfo.location,
        building: deviceInfo.building,
        status: "loading",
        voltage: "0V",
        current: "0A",
        temperature: "0°C",
        batteryLevel: 0,
        efficiency: 0,
        errorRate: 0,
        energy: "0kWh",
        revenue: "₱0",
        uses: 0,
        sessions: 0
      };
    }

    const getTimeFilteredData = (timeFilter) => {
      const revenue = deviceData.revenue?.[timeFilter] || 0;
      const uses = deviceData.uses?.[timeFilter] || 0;
      const energy = deviceData.energy?.[timeFilter] || 0;
      
      return {
        revenue: `₱${revenue}`,
        uses: uses,
        energy: `${energy}kWh`,
        sessions: deviceData.transactions?.length || 0
      };
    };

    const timeFilteredData = getTimeFilteredData(timeFilter);
    const deviceInfoData = getDeviceInfo(deviceData.device_id || deviceId);
    
    return {
      id: deviceData.device_id || deviceId,
      name: deviceInfoData.name,
      location: deviceInfoData.location,
      building: deviceInfoData.building,
      status: deviceInfoData.status || "active",
      voltage: `${deviceData.volt || 0}V`,
      current: `${deviceData.current || 0}A`,
      temperature: `${deviceData.temperature || 0}°C`,
      batteryLevel: deviceData.percentage || 0,
      efficiency: Math.round(((deviceData.power || 0) / 300) * 100), // Mock efficiency calculation
      errorRate: 0.8, // Mock error rate
      ...timeFilteredData
    };
  };

  const device = getFormattedDeviceData();

  // Format sessions from API transactions
  const getRecentSessions = () => {
    if (!deviceData?.transactions) {
      return [
    {
      id: "S001",
      user: "student@qcu.edu.ph",
      startTime: "14:30",
      duration: "45 min",
      type: "payment",
      amount: "₱25.00",
      port: "USB-C"
        }
      ];
    }

    return deviceData.transactions.map((transaction, index) => {
      // Format Firestore timestamp
      let dateTime;
      if (transaction.date_time?.seconds) {
        dateTime = new Date(transaction.date_time.seconds * 1000);
      } else {
        dateTime = new Date();
      }

      return {
        id: `T${index + 1}`,
        user: `user${index + 1}@qcu.edu.ph`,
        startTime: dateTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        duration: "30 min", // Mock duration
        type: transaction.amount > 0 ? "payment" : "rfid",
        amount: transaction.amount > 0 ? `₱${transaction.amount}` : "Free",
        port: "USB-C" // Mock port
      };
    });
  };

  const recentSessions = getRecentSessions();

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDeviceData().finally(() => {
      setIsRefreshing(false);
    });
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

  // Show loading state
  if (loading) {
    const deviceInfo = getDeviceInfo(deviceId);
    return (
      <div id="device-detail">
        <AdminHeader 
          title={`${deviceInfo.name} - ${deviceId || "QCU-001"}`}
          navigate={handleNavigation}
        />
        <div className="device-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading device data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const deviceInfo = getDeviceInfo(deviceId);
    return (
      <div id="device-detail">
        <AdminHeader 
          title={`${deviceInfo.name} - ${deviceId || "QCU-001"}`}
          navigate={handleNavigation}
        />
        <div className="device-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchDeviceData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="device-detail">
      <AdminHeader 
        title={`${device.name} - ${device.id}`}
        navigate={handleNavigation}
      />
      
      <div className="device-content">
        {/* Header with back button and time filter */}
        <div className="header-section">
          <button
            className="back-button"
            onClick={() => handleNavigation('admin-devices')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Devices</span>
          </button>
          
          <div className="header-controls">
            <div className="time-filter-group">
              <span className="time-filter-label">Time Period:</span>
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter-select"
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
              <RefreshCw className={`refresh-icon ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          </div>
        </div>

        {/* Device Overview */}
        <div className="device-overview">
          <div className="device-overview-header">
            <div className="device-overview-title">
            <div className="device-info">
                <h2 className="device-name">{device.name}</h2>
                <div className="device-location">
                  <MapPin className="w-4 h-4" />
                  <span>{device.location} • {device.building}</span>
              </div>
            </div>
            <div className="device-badges">
                <span className={`status-badge ${device.status}`}>
                {device.status}
                </span>
                <span className="device-id-badge">
                  {device.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="device-overview-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value energy">{deviceData?.energy?.total || 0}kWh</div>
                <div className="metric-label">Total Energy Generated</div>
              </div>
              <div className="metric-card">
                <div className="metric-value revenue">₱{deviceData?.revenue?.total || 0}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
              <div className="metric-card">
                <div className="metric-value uses">{deviceData?.uses?.total || 0}</div>
                <div className="metric-label">Total Uses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tab-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
              Real-time
            </button>
            <button 
              className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
            <button 
              className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('maintenance')}
            >
              Maintenance
            </button>
            <button 
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Real-time Tab */}
          {activeTab === 'realtime' && (
            <div className="tab-content">
              <div className="realtime-grid">
              {/* Technical Metrics */}
                <div className="realtime-card">
                  <div className="realtime-card-header">
                    <h3 className="realtime-card-title">
                      <Zap className="w-5 h-5" />
                    <span>Electrical Parameters</span>
                    </h3>
                  </div>
                  <div className="realtime-card-content">
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
                  
                    <div className="electrical-divider">
                  <div className="status-grid">
                    <div className="status-item">
                          <Thermometer className="status-icon temperature" />
                          <div className="status-info">
                        <div className="status-value">{device.temperature}</div>
                        <div className="status-label">Temperature</div>
                      </div>
                    </div>
                    <div className="status-item">
                          <Battery className="status-icon battery" />
                          <div className="status-info">
                        <div className="status-value">{device.batteryLevel}%</div>
                        <div className="status-label">Battery</div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
                <div className="realtime-card">
                  <div className="realtime-card-header">
                    <h3 className="realtime-card-title">
                      <Activity className="w-5 h-5" />
                    <span>System Status</span>
                    </h3>
                  </div>
                  <div className="realtime-card-content">
                    <div className="progress-section">
                      <div className="progress-item">
                        <div className="progress-header">
                          <span className="progress-label">System Efficiency</span>
                          <span className="progress-value">{device.efficiency}%</span>
                    </div>
                    <div className="progress-bar">
                          <div className="progress-fill efficiency" style={{width: `${device.efficiency}%`}}></div>
                        </div>
                    </div>
                    
                      <div className="progress-item">
                        <div className="progress-header">
                          <span className="progress-label">Error Rate</span>
                          <span className="progress-value">{device.errorRate}%</span>
                    </div>
                    <div className="progress-bar">
                          <div className="progress-fill error-rate" style={{width: `${device.errorRate}%`}}></div>
                        </div>
                    </div>
                    
                      <div className="progress-item">
                        <div className="progress-header">
                          <span className="progress-label">Battery Level</span>
                          <span className="progress-value">{device.batteryLevel}%</span>
                    </div>
                    <div className="progress-bar">
                          <div className="progress-fill battery" style={{width: `${device.batteryLevel}%`}}></div>
                        </div>
                    </div>
                  </div>

                    <div className="electrical-divider">
                      <div className="electrical-grid">
                        <div className="electrical-item">
                          <div className="electrical-label">Total Energy Generated</div>
                          <div className="electrical-value">{deviceData?.energy?.total || 0}kWh</div>
                        </div>
                        <div className="electrical-item">
                          <div className="electrical-label">Total Uses</div>
                          <div className="electrical-value">{deviceData?.uses?.total || 0}</div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="alerts-card">
                  <div className="alerts-header">
                    <h3 className="alerts-title">
                      <AlertTriangle className="w-5 h-5" />
                    <span>Active Alerts</span>
                    </h3>
                  </div>
                  <div className="alerts-content">
                  <div className="alerts-list">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="alert-item">
                          <div className={`alert-icon ${alert.type}`}>
                            {alert.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                            {alert.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                            {alert.type === 'info' && <CheckCircle className="w-4 h-4" />}
                          </div>
                        <div className="alert-content">
                          <div className="alert-message">{alert.message}</div>
                          <div className="alert-time">{alert.time}</div>
                        </div>
                          <span className="alert-severity">
                          {alert.severity}
                          </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="tab-content">
            <div className="sessions-card">
                <div className="sessions-header">
                  <h3 className="sessions-title">Recent Charging Sessions</h3>
                  <p className="sessions-description">Latest user sessions and transactions</p>
              </div>
                <div className="sessions-content">
                <div className="sessions-list">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-info">
                          <div className={`session-icon ${session.type}`}>
                          {session.type === 'rfid' ? (
                              <Clock className="w-4 h-4" />
                          ) : (
                              <DollarSign className="w-4 h-4" />
                          )}
                        </div>
                          <div className="session-details">
                          <div className="session-user">{session.user}</div>
                            <div className="session-meta">
                            {session.startTime} • {session.duration} • {session.port}
                          </div>
                        </div>
                      </div>
                      <div className="session-amount">
                          <div className="session-amount-value">{session.amount}</div>
                          <span className={`session-type-badge ${session.type}`}>
                          {session.type === 'rfid' ? 'RFID' : 'Payment'}
                          </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="tab-content">
            <div className="maintenance-grid">
              <div className="maintenance-card">
                  <div className="maintenance-header">
                    <h3 className="maintenance-title">Maintenance Schedule</h3>
                </div>
                  <div className="maintenance-content">
                    <div className="maintenance-list">
                  <div className="maintenance-item">
                        <div className="maintenance-info">
                    <Calendar className="maintenance-icon" />
                          <div className="maintenance-details">
                            <div className="maintenance-label">Last Maintenance</div>
                      <div className="maintenance-date">{device.lastMaintenance}</div>
                    </div>
                        </div>
                        <span className="maintenance-status completed">
                          Completed
                        </span>
                  </div>
                  
                  <div className="maintenance-item">
                        <div className="maintenance-info">
                    <Calendar className="maintenance-icon" />
                          <div className="maintenance-details">
                            <div className="maintenance-label">Next Maintenance</div>
                      <div className="maintenance-date">2024-12-22</div>
                    </div>
                        </div>
                        <span className="maintenance-status scheduled">
                          Scheduled
                        </span>
                      </div>
                  </div>
                </div>
              </div>

                <div className="maintenance-card">
                  <div className="maintenance-header">
                    <h3 className="maintenance-title">Device Information</h3>
                </div>
                  <div className="maintenance-content">
                    <div className="device-info-list">
                      <div className="device-info-item">
                        <span className="device-info-label">Installation Date</span>
                        <span className="device-info-value">{device.installDate}</span>
                    </div>
                      <div className="device-info-item">
                        <span className="device-info-label">Firmware Version</span>
                        <span className="device-info-value">v2.4.1</span>
                    </div>
                      <div className="device-info-item">
                        <span className="device-info-label">Hardware Version</span>
                        <span className="device-info-value">ECS-Gen2</span>
                    </div>
                      <div className="device-info-item">
                        <span className="device-info-label">Serial Number</span>
                        <span className="device-info-value">EC240115001</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title">Performance Trends</h3>
                </div>
                  <div className="analytics-content">
                  <div className="trends-list">
                    <div className="trend-item">
                      <span className="trend-label">Energy Generation</span>
                      <div className="trend-value">
                          <TrendingUp className="trend-icon positive" />
                          <span className="trend-percentage positive">+12.5%</span>
                      </div>
                    </div>
                    
                    <div className="trend-item">
                      <span className="trend-label">Usage Frequency</span>
                      <div className="trend-value">
                          <TrendingUp className="trend-icon positive" />
                          <span className="trend-percentage positive">+8.3%</span>
                      </div>
                    </div>
                    
                    <div className="trend-item">
                      <span className="trend-label">System Efficiency</span>
                      <div className="trend-value">
                          <TrendingDown className="trend-icon negative" />
                          <span className="trend-percentage negative">-2.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title">Usage Statistics</h3>
                  </div>
                  <div className="analytics-content">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-item-value">{device.sessions}</div>
                        <div className="stat-item-label">Sessions</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-item-value">{device.energy}</div>
                        <div className="stat-item-label">Energy</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-item-value">{device.uses}</div>
                        <div className="stat-item-label">Uses</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-item-value">{device.revenue}</div>
                        <div className="stat-item-label">Revenue</div>
                      </div>
                </div>
                    
                    {/* Additional API Data */}
                    {deviceData && (
                      <div className="stats-grid" style={{ marginTop: '1rem' }}>
                        <div className="stat-item">
                          <div className="stat-item-value">{deviceData.total_hours || 0}h</div>
                          <div className="stat-item-label">Total Hours</div>
                    </div>
                        <div className="stat-item">
                          <div className="stat-item-value">{deviceData.power || 0}W</div>
                          <div className="stat-item-label">Power</div>
                    </div>
                        <div className="stat-item">
                          <div className="stat-item-value">{deviceData.percentage || 0}%</div>
                          <div className="stat-item-label">Battery</div>
                    </div>
                        <div className="stat-item">
                          <div className="stat-item-value">{deviceData.temperature || 0}°C</div>
                          <div className="stat-item-label">Temperature</div>
                    </div>
                  </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
