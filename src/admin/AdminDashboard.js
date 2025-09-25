import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Battery, 
  MapPin,
  Activity,
  CreditCard,
  Filter
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { authenticatedAdminFetch } = useAdminAuth();
  
  // State management
  const [overviewData, setOverviewData] = useState({
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      total: 0
    },
    uses: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      total: 0
    },
    energy: { // standby
      daily: 0,
      weekly: 0,
      monthly: 0,
      total: 0
    },
    transactions: [],
    maintenance: [], //standby
    total_hours: 0,
    volt: 0,
    current: 0,
    power: 0,
    temperature: 0,
    percentage: 0,
    devices: [],
    active_devices: 0,
    total_devices: 0,
    power_output: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('daily');
  const [connectionStatus, setConnectionStatus] = useState('testing');

  // Test API endpoint availability
  const testAPIEndpoint = async () => {
    try {
      console.log('=== TESTING API ENDPOINTS ===');
      
      // Test 1: Check if /admin/dashboard exists
      console.log('Test 1: Checking /admin/dashboard endpoint...');
      const dashboardResponse = await fetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
      console.log('Dashboard endpoint status:', dashboardResponse.status);
      console.log('Dashboard endpoint headers:', Object.fromEntries(dashboardResponse.headers.entries()));
      
      // Test 2: Check if /overview/getoverview works (as comparison)
      console.log('Test 2: Checking /overview/getoverview endpoint...');
      const overviewResponse = await fetch('https://api-qcusolarcharge.up.railway.app/overview/getoverview');
      console.log('Overview endpoint status:', overviewResponse.status);
      
      // Test 3: Check authentication
      console.log('Test 3: Checking authenticatedAdminFetch function...');
      console.log('authenticatedAdminFetch type:', typeof authenticatedAdminFetch);
      
      console.log('=== API TEST COMPLETE ===');
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  // Fetch dashboard data from API
  const fetchOverviewData = useCallback(async () => {
    try {
      console.log('=== FETCHING DASHBOARD DATA ===');
      console.log('Using authenticatedAdminFetch:', typeof authenticatedAdminFetch);
      
      // First test the endpoint
      await testAPIEndpoint();
      
      console.log('Fetching dashboard data from /admin/dashboard...');
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Dashboard API response status:', response.status);
      console.log('Dashboard API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dashboard API response data:', data);
      console.log('Data keys:', Object.keys(data));
      console.log('Data structure:', JSON.stringify(data, null, 2));
      
      // Handle the specific API response format
      if (data.revenue || data.uses || data.energy_generated || data.devices) {
        console.log('✅ Using direct API data format');
        
        // Calculate aggregate values from devices if available
        let aggregateVolt = 0;
        let aggregateCurrent = 0;
        let aggregatePower = 0;
        let aggregateTemperature = 0;
        let aggregatePercentage = 0;
        let activeDevices = 0;
        
        if (data.devices && Array.isArray(data.devices)) {
          activeDevices = data.devices.filter(device => device.status === 'active').length;
          
          // Calculate averages from active devices
          const activeDevicesList = data.devices.filter(device => device.status === 'active');
          if (activeDevicesList.length > 0) {
            aggregateVolt = activeDevicesList.reduce((sum, device) => sum + (device.volt || 0), 0) / activeDevicesList.length;
            aggregateCurrent = activeDevicesList.reduce((sum, device) => sum + (device.current || 0), 0) / activeDevicesList.length;
            aggregatePower = activeDevicesList.reduce((sum, device) => sum + (device.power || 0), 0) / activeDevicesList.length;
            aggregateTemperature = activeDevicesList.reduce((sum, device) => sum + (device.temperature || 0), 0) / activeDevicesList.length;
            aggregatePercentage = activeDevicesList.reduce((sum, device) => sum + (device.percentage || 0), 0) / activeDevicesList.length;
          }
        }
        
        // Map the API data to our expected format
        const mappedData = {
          revenue: data.revenue || { daily: 0, weekly: 0, monthly: 0, total: 0 },
          uses: data.uses || { daily: 0, weekly: 0, monthly: 0, total: 0 },
          energy: data.energy_generated || { daily: 0, weekly: 0, monthly: 0, total: 0 },
          transactions: data.transactions || [],
          maintenance: [], // Not provided in API yet
          total_hours: 0, // Not provided in API yet
          volt: aggregateVolt,
          current: aggregateCurrent,
          power: aggregatePower,
          temperature: aggregateTemperature,
          percentage: aggregatePercentage,
          // Additional data from API
          devices: data.devices || [],
          active_devices: data.active_devices || activeDevices,
          total_devices: data.total_devices || (data.devices ? data.devices.length : 0),
          power_output: data.power_output || aggregatePower
        };
        
        setOverviewData(mappedData);
        setConnectionStatus('connected');
        console.log('✅ Dashboard data mapped and set successfully:', mappedData);
        console.log('📊 Device Summary:', {
          total: mappedData.total_devices,
          active: mappedData.active_devices,
          avgVolt: aggregateVolt.toFixed(2),
          avgCurrent: aggregateCurrent.toFixed(2),
          avgPower: aggregatePower.toFixed(2),
          avgTemp: aggregateTemperature.toFixed(2),
          avgPercentage: aggregatePercentage.toFixed(2)
        });
      } else {
        setConnectionStatus('invalid_format');
        console.log('❌ Could not extract dashboard data, using fallback');
        console.log('Available keys:', Object.keys(data));
        setOverviewData({
          revenue: { daily: 0, weekly: 0, monthly: 0, total: 0 },
          uses: { daily: 0, weekly: 0, monthly: 0, total: 0 },
          energy: { daily: 0, weekly: 0, monthly: 0, total: 0 },
          transactions: [],
          maintenance: [],
          total_hours: 0,
          volt: 0,
          current: 0,
          power: 0,
          temperature: 0,
          percentage: 0,
          devices: [],
          active_devices: 0,
          total_devices: 0,
          power_output: 0
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Error fetching dashboard data:', error);
      console.log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.log('Using fallback data due to error');
      // Use fallback data on error
      setOverviewData({
        revenue: { daily: 0, weekly: 0, monthly: 0, total: 0 },
        uses: { daily: 0, weekly: 0, monthly: 0, total: 0 },
        energy: { daily: 0, weekly: 0, monthly: 0, total: 0 },
        transactions: [],
        maintenance: [],
        total_hours: 0,
        volt: 0,
        current: 0,
        power: 0,
        temperature: 0,
        percentage: 0
      });
      setError(`Failed to load dashboard data: ${error.message}`);
    }
  }, [authenticatedAdminFetch]);

  // Fetch recent reports from API
  const fetchRecentReports = useCallback(async () => {
    try {
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/report/getReports');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const reportsData = data.value || data;
      setRecentReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      // Don't set error state for reports as it's not critical
    }
  }, [authenticatedAdminFetch]);

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchOverviewData(),
          fetchRecentReports()
        ]);
      } catch (error) {
        console.error('Error in fetchAllData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchOverviewData, fetchRecentReports]);

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
      case 'admin-contact':
        navigate('/admin/contact');
        break;
      case 'admin-device-detail':
        navigate(`/admin/device/${deviceId}`);
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  // Utility functions
  const formatPower = (power) => {
    if (power >= 1000) {
      return `${(power / 1000).toFixed(1)}kW`;
    }
    return `${power.toFixed(1)}W`;
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

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  // Calculate overview stats from API data and time filter
  const calculateOverviewStats = () => {
    return [
      {
        title: "Energy Generated", 
        value: `${overviewData.energy[timeFilter]} kWh`,
        change: "+5.2%", // Static for now, can be calculated from historical data
      changeType: "positive",
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: "Revenue Generated",
        value: `₱${overviewData.revenue[timeFilter].toLocaleString()}`,
        change: "+3.8%", // Static for now, can be calculated from historical data
      changeType: "positive",
      icon: <DollarSign className="w-4 h-4" />
    },
    {
        title: "Device Uses",
        value: `${overviewData.uses[timeFilter]} sessions`,
        change: "+2.1%", // Static for now, can be calculated from historical data
      changeType: "positive",
        icon: <Users className="w-4 h-4" />
      },
      {
        title: "Active Devices",
        value: `${overviewData.active_devices}/${overviewData.total_devices}`,
        change: "+5.2%", // Static for now, can be calculated from historical data
        changeType: "positive",
        icon: <Activity className="w-4 h-4" />
      }
    ];
  };

  const overviewStats = calculateOverviewStats();

  // Calculate device revenue from transactions
  const calculateDeviceRevenue = (deviceId, transactions) => {
    if (!transactions || !Array.isArray(transactions) || !deviceId) {
      return 0;
    }
    
    // Filter transactions for this specific device using device_id
    const deviceTransactions = transactions.filter(transaction => 
      transaction.device_id === deviceId
    );
    
    // Sum up the amounts from transactions
    const totalRevenue = deviceTransactions.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount) || parseFloat(transaction.value) || 0;
      return sum + amount;
    }, 0);
    
    return totalRevenue;
  };

  // Use devices from API data, with fallback to mock data
  const deviceStatus = overviewData.devices && overviewData.devices.length > 0 
    ? overviewData.devices.map(device => {
        // Try to find the actual device ID field (same logic as AdminDevices)
        const actualDeviceId = device.id || device.device_id || device.deviceId || device._id;
        
        // Calculate individual device revenue from actual transactions
        const deviceRevenue = calculateDeviceRevenue(actualDeviceId, overviewData.transactions);
        
        return {
          id: actualDeviceId || `Device-${Math.random()}`,
          name: device.name || "Unknown Device",
          location: device.location || "Unknown Location",
          status: device.status || "unknown",
          voltage: `${device.volt || 0}V`,
          power: formatPower(device.power || 0),
          usage: device.percentage || 0,
          revenue: `₱${deviceRevenue.toFixed(0)}`, // Use actual transaction revenue
          sessions: Math.floor((device.percentage || 0) / 4) // Calculate based on usage
        };
      })
    : [
        // Fallback mock data if no devices from API
    {
      id: "QCU-001",
      name: "Main Library",
      location: "1st Floor, Main Entrance",
      status: "active",
      voltage: "24.2V",
      power: "3.2kW",
      usage: 85,
      revenue: "₱2,340",
          sessions: 45
    },
    {
      id: "QCU-002", 
      name: "Student Center",
      location: "Food Court Area",
      status: "active",
      voltage: "23.8V",
      power: "2.9kW",
      usage: 72,
      revenue: "₱1,890",
          sessions: 32
    },
    {
      id: "QCU-003",
      name: "Engineering Building",
      location: "Lobby",
      status: "maintenance",
      voltage: "0V",
      power: "0kW",
      usage: 0,
      revenue: "₱0",
          sessions: 0
    },
    {
      id: "QCU-004",
      name: "Sports Complex",
      location: "Main Entrance",
      status: "active",
      voltage: "24.5V",
      power: "1.8kW",
      usage: 45,
      revenue: "₱1,120",
          sessions: 28
        }
      ];

  // Use transactions from API data, limit to 3 most recent
  const recentTransactions = overviewData.transactions.slice(0, 3).map((transaction, index) => ({
    id: transaction.id || `TXN-${index + 1}`,
    user: transaction.user || transaction.email || "Unknown User",
    station: transaction.station || transaction.device_id || "Unknown Station",
    amount: transaction.amount || "₱0.00",
    type: transaction.type || "payment",
    time: transaction.time || transaction.timestamp || "Unknown time"
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      default: return 'status-unknown';
    }
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? (
      <TrendingUp className="w-4 h-4 change-icon-positive" />
    ) : (
      <TrendingDown className="w-4 h-4 change-icon-negative" />
    );
  };

  const getChangeColor = (type) => {
    return type === 'positive' ? 'change-positive' : 'change-negative';
  };

  return (
    <div id="admin-dashboard">
      <AdminHeader 
        title="Dashboard Overview" 
        navigate={handleNavigation}
      />
      
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => {
              setLoading(true);
              setError(null);
              fetchOverviewData();
            }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Filter Controls */}
            <div className="filter-controls">
              <div className="dashboard-header">
                <h2 className="dashboard-title">Dashboard Overview</h2>
              </div>
              <div className="filter-group">
                <Filter className="w-4 h-4 filter-icon" />
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          {overviewStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-icon">{stat.icon}</div>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change">
                  {getChangeIcon(stat.changeType)}
                  <span className={getChangeColor(stat.changeType)}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="main-grid">
          {/* Device Status */}
          <div className="main-card">
            <div className="card-header">
              <div>
                <div className="card-title">Device Status</div>
                <div className="card-description">Real-time monitoring of all charging stations</div>
              </div>
              <button 
                className="view-all-button"
                onClick={() => handleNavigation('admin-devices')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
                  {deviceStatus.length > 0 ? (
                    deviceStatus.map((device) => (
                <div 
                  key={device.id} 
                  className="device-item"
                  onClick={() => handleNavigation('admin-device-detail', device.id)}
                >
                  <div className="device-info">
                    <div className={`status-indicator ${getStatusColor(device.status)}`}></div>
                    <div>
                      <div className="device-name">{device.name}</div>
                      <div className="device-location">
                        <MapPin className="w-3 h-3" />
                        <span>{device.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="device-stats">
                    <div className="device-power">{device.power}</div>
                    <div className="device-voltage">{device.voltage}</div>
                          <div className="device-usage">{device.usage}%</div>
                  </div>
                </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No device data available</p>
                    </div>
                  )}
            </div>
          </div>

          {/* Energy Production */}
          <div className="main-card">
            <div className="card-header">
              <div className="card-title">
                <Battery className="w-5 h-5" />
                <span>Energy Production</span>
              </div>
              <div className="card-description">Daily energy generation across all stations</div>
            </div>
            <div className="card-content">
              <div className="energy-stats">
                <div className="energy-progress">
                  <div className="progress-label">
                    <span>Current Power Output</span>
                    <span className="progress-value">{overviewData.power_output || overviewData.power}W</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min((overviewData.percentage || 0), 100)}%`}}></div>
                  </div>
                  <div className="progress-text">
                    {overviewData.percentage || 0}% battery level
                  </div>
                </div>
                
                <div className="energy-metrics">
                  <div className="metric-card metric-green">
                    <div className="metric-value">{overviewData.volt}V</div>
                    <div className="metric-label">Voltage</div>
                  </div>
                  <div className="metric-card metric-blue">
                    <div className="metric-value">{overviewData.current}A</div>
                    <div className="metric-label">Current</div>
                  </div>
                </div>
                
                <div className="energy-generation">
                  <div className="generation-header">
                    <span className="generation-title">Energy Generated Today</span>
                    <span className="generation-value">{overviewData.energy.daily}kWh</span>
                  </div>
                  <div className="generation-details">
                    <div className="generation-item">
                      <span>This Week:</span>
                      <span>{overviewData.energy.weekly}kWh</span>
                    </div>
                    <div className="generation-item">
                      <span>This Month:</span>
                      <span>{overviewData.energy.monthly}kWh</span>
                    </div>
                    <div className="generation-item">
                      <span>Total:</span>
                      <span>{overviewData.energy.total}kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="main-card">
            <div className="card-header">
              <div className="card-title">Recent Transactions</div>
              <div className="card-description">Latest charging sessions and payments</div>
            </div>
            <div className="card-content">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-icon">
                      {transaction.type === 'rfid' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="transaction-user">{transaction.user}</div>
                      <div className="transaction-details">
                        Station {transaction.station} • {transaction.time}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <div className="amount-value">{transaction.amount}</div>
                    <div className={`amount-badge ${transaction.type === 'rfid' ? 'badge-rfid' : 'badge-payment'}`}>
                      {transaction.type === 'rfid' ? 'RFID' : 'Payment'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Energy & Revenue Charts Section */}
        <div className="charts-grid">

        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
