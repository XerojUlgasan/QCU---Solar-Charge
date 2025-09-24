import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Battery, 
  Zap, 
  Thermometer, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
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

      // First, get device basic info from dashboard endpoint
      console.log('🔍 Fetching device basic info from dashboard...');
      const dashboardUrl = 'https://api-qcusolarcharge.up.railway.app/admin/dashboard';
      const dashboardResponse = await authenticatedAdminFetch(dashboardUrl, {
        signal: controller.signal
      });
      
      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
      }
      
      const dashboardData = await dashboardResponse.json();
      console.log('📊 Dashboard data:', dashboardData);
      
      // Find the specific device in the dashboard data
      const devices = dashboardData.devices || [];
      const foundDevice = devices.find(d => {
        const deviceIdField = d.id || d.device_id || d.deviceId || d._id;
        return deviceIdField === deviceId;
      });
      
      if (!foundDevice) {
        throw new Error(`Device ${deviceId} not found in dashboard data`);
      }
      
      console.log('✅ Found device in dashboard:', foundDevice);
      
      // Then, get detailed metrics from devices endpoint
      const devicesUrl = `https://api-qcusolarcharge.up.railway.app/admin/devices?device_id=${deviceId}`;
      console.log('🔍 Fetching detailed metrics from:', devicesUrl);
      
      const response = await authenticatedAdminFetch(devicesUrl, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log('📊 Devices API Response Status:', response.status);
      console.log('📊 Devices API Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Devices API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Device detail API response:', data);
      console.log('📊 Response data keys:', Object.keys(data));

      // Calculate device revenue from transactions
      const calculateDeviceRevenue = (deviceId, transactions) => {
        if (!transactions || !Array.isArray(transactions)) {
          console.log(`❌ No transactions data for device ${deviceId}`);
          return 0;
        }
        
        // Handle undefined deviceId
        if (!deviceId) {
          console.log(`❌ Device ID is undefined, cannot calculate revenue`);
          return 0;
        }
        
        console.log(`🔍 Calculating revenue for device ${deviceId}`);
        console.log(`📊 Total transactions available: ${transactions.length}`);
        
        // Filter transactions for this specific device using device_id
        const deviceTransactions = transactions.filter(transaction => {
          // Use device_id as the primary field (as confirmed by your groupmate)
          const transactionDeviceId = transaction.device_id;
          
          // Safe comparison with null checks
          const matches = transactionDeviceId && deviceId && (
            transactionDeviceId === deviceId || 
            transactionDeviceId === deviceId.toString() ||
            deviceId === transactionDeviceId.toString()
          );
          
          if (matches) {
            console.log(`✅ Found transaction for ${deviceId}:`, transaction);
          }
          
          return matches;
        });
        
        console.log(`📊 Found ${deviceTransactions.length} transactions for device ${deviceId}`);
        
        // Sum up the amounts from transactions
        const totalRevenue = deviceTransactions.reduce((sum, transaction) => {
          const amount = parseFloat(transaction.amount) || parseFloat(transaction.value) || 0;
          console.log(`💰 Adding transaction amount: ₱${amount}`);
          return sum + amount;
        }, 0);
        
        console.log(`💰 Total revenue for ${deviceId}: ₱${totalRevenue}`);
        return totalRevenue;
      };

      // Map API data to device structure (combine dashboard info + detailed metrics)
      console.log('🔧 Mapping device data...');
      console.log('📊 Dashboard device info:', foundDevice);
      console.log('📊 Detailed metrics data:', data);
      
      const mappedDevice = {
        id: deviceId, // Use the deviceId from URL params
        name: foundDevice.name || 'Unknown Device', // From dashboard
        location: foundDevice.location || 'Unknown Location', // From dashboard
        building: foundDevice.building || 'Unknown Building', // From dashboard
        status: foundDevice.status || 'unknown', // From dashboard
        installDate: "2024-01-15", // Not in API yet
        lastMaintenance: "2024-12-01", // Not in API yet
        
        // Real-time metrics from dashboard (more current)
        voltage: `${foundDevice.volt || 0}V`,
        current: `${foundDevice.current || 0}A`,
        power: formatPower(foundDevice.power || 0),
        energy: `${(foundDevice.energy || 0).toFixed(1)}kWh`, // From dashboard
        temperature: `${foundDevice.temperature || 0}°C`,
        batteryLevel: foundDevice.percentage || 0,
        
        // Usage data with transaction-based revenue from detailed endpoint
        usage: foundDevice.percentage || 0,
        sessionsToday: Math.floor((foundDevice.percentage || 0) / 4), // Calculate based on usage
        revenue: `₱${calculateDeviceRevenue(deviceId, data.transactions).toFixed(0)}`, // Use actual transaction revenue from detailed endpoint
        freeHours: Math.floor((foundDevice.percentage || 0) / 2), // Calculate based on usage
        
        // Performance (mock for now)
    uptime: 99.2,
    efficiency: 94.8,
        errorRate: 0.8,
        
        // Store detailed metrics for time filtering
        detailedMetrics: data
      };

      console.log('✅ Mapped device:', mappedDevice);
      setDevice(mappedDevice);
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError(err.message);
      // Set fallback device data
      setDevice({
        id: deviceId,
        name: 'Unknown Device',
        location: 'Unknown Location',
        building: 'Unknown Building',
        status: 'unknown',
        installDate: '2024-01-15',
        lastMaintenance: '2024-12-01',
        voltage: '0V',
        current: '0A',
        power: '0W',
        energy: '0kWh',
        temperature: '0°C',
        batteryLevel: 0,
        usage: 0,
        sessionsToday: 0,
        revenue: '₱0',
        freeHours: 0,
        uptime: 0,
        efficiency: 0,
        errorRate: 0,
        detailedMetrics: {}
      });
    } finally {
      setLoading(false);
    }
  }, [deviceId, authenticatedAdminFetch]);

  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDeviceData();
    setIsRefreshing(false);
  };

  const handleNavigation = (route, id) => {
    navigate(`/${route}${id ? `/${id}` : ''}`);
  };

  // Format power display
  const formatPower = (power) => {
    if (power >= 1000) {
      return `${(power / 1000).toFixed(1)}kW`;
    }
    return `${power.toFixed(1)}W`;
  };

  // Get time-filtered data from API response
  const getTimeFilteredData = (timeFilter) => {
    if (!device) {
      return {
        energy: "0kWh",
        revenue: "₱0",
        uses: 0,
        sessions: 0
      };
    }

    // Use API data structure: data.energy, data.revenue, data.uses (from detailed endpoint)
    // Note: We need to access the detailed metrics data that was fetched
    const detailedData = device.detailedMetrics || {};
    
    const apiData = {
      energy: {
        daily: `${(detailedData.energy?.daily || 0).toFixed(1)}kWh`,
        weekly: `${(detailedData.energy?.weekly || 0).toFixed(1)}kWh`,
        monthly: `${(detailedData.energy?.monthly || 0).toFixed(1)}kWh`,
        total: `${(detailedData.energy?.total || 0).toFixed(1)}kWh`
      },
      revenue: {
        daily: `₱${(detailedData.revenue?.daily || 0).toLocaleString()}`,
        weekly: `₱${(detailedData.revenue?.weekly || 0).toLocaleString()}`,
        monthly: `₱${(detailedData.revenue?.monthly || 0).toLocaleString()}`,
        total: `₱${(detailedData.revenue?.total || 0).toLocaleString()}`
      },
      uses: {
        daily: detailedData.uses?.daily || 0,
        weekly: detailedData.uses?.weekly || 0,
        monthly: detailedData.uses?.monthly || 0,
        total: detailedData.uses?.total || 0
      },
      sessions: {
        daily: device.sessionsToday || 0,
        weekly: (device.sessionsToday || 0) * 7,
        monthly: (device.sessionsToday || 0) * 30,
        total: (device.sessionsToday || 0) * 365
      }
    };

    return {
      energy: apiData.energy[timeFilter] || apiData.energy.daily,
      revenue: apiData.revenue[timeFilter] || apiData.revenue.daily,
      uses: apiData.uses[timeFilter] || apiData.uses.daily,
      sessions: apiData.sessions[timeFilter] || apiData.sessions.daily
    };
  };

  // Get recent sessions from transactions
  const getRecentSessions = () => {
    if (!device?.detailedMetrics?.transactions || !Array.isArray(device.detailedMetrics.transactions)) {
      console.log('📊 No transactions data available for sessions');
      return [];
    }

    console.log('📊 Available transactions:', device.detailedMetrics.transactions);
    console.log('📊 Device ID for filtering:', device.id);
    
    // Debug transaction structure
    if (device.detailedMetrics.transactions.length > 0) {
      console.log('📊 First transaction sample:', device.detailedMetrics.transactions[0]);
      console.log('📊 Transaction fields:', Object.keys(device.detailedMetrics.transactions[0]));
    }

    // Filter transactions for this device and sort by most recent
    const deviceTransactions = device.detailedMetrics.transactions
      .filter(transaction => transaction.device_id === device.id)
      .sort((a, b) => new Date(b.timestamp || b.created_at || b.date) - new Date(a.timestamp || a.created_at || a.date))
      .slice(0, 5); // Get latest 5 transactions

    console.log('📊 Filtered device transactions:', deviceTransactions);
    
    // Debug each transaction's fields
    deviceTransactions.forEach((transaction, index) => {
      console.log(`📊 Transaction ${index + 1} fields:`, Object.keys(transaction));
      console.log(`📊 Transaction ${index + 1} data:`, transaction);
    });

    // Map transactions to session format
    const sessions = deviceTransactions.map((transaction, index) => {
      // Try multiple possible field names for user
      const user = transaction.user_email || 
                   transaction.user_id || 
                   transaction.user || 
                   transaction.email ||
                   transaction.customer_email ||
                   transaction.customer_id ||
                   transaction.client_email ||
                   transaction.client_id ||
                   "Unknown User";
      
      // Try multiple possible field names for timestamp
      const timestamp = transaction.timestamp || 
                       transaction.created_at || 
                       transaction.date ||
                       transaction.time ||
                       transaction.createdAt ||
                       transaction.created ||
                       transaction.transaction_date ||
                       transaction.transaction_time;
      
      console.log(`📊 Mapping transaction ${index + 1}:`, {
        originalUser: transaction.user_email || transaction.user_id || transaction.user,
        mappedUser: user,
        originalTime: timestamp,
        formattedTime: formatTime(timestamp),
        amount: transaction.amount
      });
      
      return {
        id: transaction.id || `T${index + 1}`,
        user: user,
        startTime: formatTime(timestamp),
        duration: calculateDuration(timestamp),
        type: transaction.payment_method === 'rfid' ? 'rfid' : 'payment',
        amount: transaction.amount ? `₱${parseFloat(transaction.amount).toFixed(2)}` : '₱0.00',
        port: transaction.port || 'USB-C'
      };
    });

    console.log('📊 Mapped sessions:', sessions);
    return sessions;
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  // Helper function to calculate duration
  const calculateDuration = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours}h ago`;
      } else {
        const days = Math.floor(diffMins / 1440);
        return `${days}d ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const recentSessions = getRecentSessions();

  const alerts = [
    {
      id: "A001",
      type: "warning",
      message: "Battery temperature slightly elevated",
      time: "2 hours ago",
      severity: "Medium"
    },
    {
      id: "A002",
      type: "info",
      message: "Scheduled maintenance completed",
      time: "1 day ago",
      severity: "Low"
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="alert-icon warning" />;
      case 'error':
        return <XCircle className="alert-icon error" />;
      case 'success':
        return <CheckCircle className="alert-icon success" />;
      default:
        return <Info className="alert-icon info" />;
    }
  };

  if (loading) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Loading Device Details..."
          navigate={handleNavigation}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading device information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Device Detail Error"
          navigate={handleNavigation}
        />
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Device</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Device Not Found"
          navigate={handleNavigation}
        />
        <div className="error-container">
          <div className="error-message">
            <h3>Device Not Found</h3>
            <p>The requested device could not be found.</p>
            <button className="retry-button" onClick={() => handleNavigation('admin-devices')}>
              Back to Devices
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
            <ArrowLeft className="icon" />
            Back to Devices
          </button>
          
          <div className="header-controls">
            <div className="time-filter-group">
              <label className="time-filter-label">Time Period:</label>
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
              <RefreshCw className={`icon ${isRefreshing ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>
        </div>

        {/* Device Overview Cards */}
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-header">
              <div className="card-title">Device Status</div>
              <div className={`status-indicator ${device.status}`}></div>
            </div>
            <div className="card-content">
              <div className="status-info">
                <div className="status-text">{device.status}</div>
                <div className="status-location">{device.location}</div>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-header">
              <div className="card-title">Power Output</div>
              <Zap className="card-icon" />
            </div>
            <div className="card-content">
              <div className="metric-value">{device.power}</div>
              <div className="metric-label">Current Generation</div>
            </div>
        </div>

        <div className="overview-card">
            <div className="card-header">
              <div className="card-title">Battery Level</div>
              <Battery className="card-icon" />
            </div>
            <div className="card-content">
              <div className="metric-value">{device.batteryLevel}%</div>
              <div className="metric-label">Charge Status</div>
              </div>
            </div>

          <div className="overview-card">
            <div className="card-header">
              <div className="card-title">Temperature</div>
              <Thermometer className="card-icon" />
            </div>
            <div className="card-content">
              <div className="metric-value">{device.temperature}</div>
              <div className="metric-label">System Temp</div>
              </div>
            </div>
          </div>
          
        {/* Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Energy Generated</div>
              <div className="metric-period">{timeFilter}</div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{timeFilteredData.energy}</div>
              <div className="metric-trend">
                <TrendingUp className="trend-icon" />
                <span className="trend-text">+5.2%</span>
              </div>
            </div>
              </div>

              <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Revenue</div>
              <div className="metric-period">{timeFilter}</div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{timeFilteredData.revenue}</div>
              <div className="metric-trend">
                <TrendingUp className="trend-icon" />
                <span className="trend-text">+12.8%</span>
              </div>
            </div>
              </div>

              <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Usage Sessions</div>
              <div className="metric-period">{timeFilter}</div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{timeFilteredData.sessions}</div>
              <div className="metric-trend">
                <TrendingUp className="trend-icon" />
                <span className="trend-text">+8.1%</span>
              </div>
            </div>
              </div>

              <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Total Uses</div>
              <div className="metric-period">{timeFilter}</div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{timeFilteredData.uses}</div>
              <div className="metric-trend">
                <TrendingUp className="trend-icon" />
                <span className="trend-text">+3.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button 
            className={`tab-button ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
            Real-time Data
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

        {/* Tab Content */}
        <div className="tab-content-container">
          {/* Real-time Tab */}
          <div className={`tab-content ${activeTab === 'realtime' ? 'active' : ''}`}>
            <div className="realtime-grid">
              <div className="realtime-card">
                <div className="card-header">
                  <div className="card-title">System Alerts</div>
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
            </div>
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
