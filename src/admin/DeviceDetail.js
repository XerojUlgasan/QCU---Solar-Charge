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
  Users,
  CreditCard,
  ChevronDown,
  History,
  Info,
  Wrench,
  Banknote,
  Coins
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
  const [timeFilter, setTimeFilter] = useState('total');
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [sessionsFilter, setSessionsFilter] = useState('newest');
  const [deviceData, setDeviceData] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch device data from API
  const fetchDeviceData = useCallback(async () => {
    if (!deviceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING DEVICE DATA ===');
      console.log('Device ID:', deviceId);
      
      // Try the devices endpoint first, fallback to dashboard if it fails
      let response;
      let data;
      
      try {
        console.log('Trying devices endpoint...');
        response = await authenticatedAdminFetch(`/admin/devices?device_id=${deviceId}`);
        
        console.log('Device response status:', response.status);
        console.log('Device response ok:', response.ok);
      
      if (!response.ok) {
          throw new Error(`Devices endpoint failed with status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.log('Non-JSON response from devices endpoint:', textResponse.substring(0, 200));
          throw new Error('Devices endpoint returned non-JSON response');
        }
        
        data = await response.json();
        console.log('Device data with alerts:', data);
        
        // The API returns the device data directly with alerts
        if (data && data.device_id) {
          console.log('Found device data from devices endpoint:', data);
          setDeviceData(data);
          return; // Success, exit early
        } else {
          throw new Error('Device data not found in devices endpoint response');
        }
        
      } catch (devicesError) {
        console.log('Devices endpoint failed, trying dashboard endpoint...', devicesError.message);
        
        // Fallback to dashboard endpoint
        response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`Both endpoints failed. Devices: ${devicesError.message}, Dashboard: ${response.status}`);
        }
        
        data = await response.json();
        console.log('Dashboard data:', data);
        
        // Find the specific device in the devices array
        const device = data.devices?.find(d => d.device_id === deviceId);
        if (device) {
          console.log('Found device in dashboard data:', device);
        
        // Create device data structure that matches what the component expects
        const deviceData = {
          device_id: device.device_id,
            name: device.name,
            location: device.location,
            building: device.building,
            status: device.status,
            percentage: device.percentage,
            temperature: device.temperature,
            volt: device.volt,
            current: device.current,
            power: device.power,
          energy: device.energy,
          last_updated: device.last_updated,
          // Add dashboard metrics
          energy_generated: data.energy_generated,
          revenue: data.revenue,
          uses: data.uses,
          transactions: data.transactions?.filter(t => t.device_id === deviceId) || [],
          energy_history: data.energy_history?.filter(e => e.device_id === deviceId) || [],
          total_devices: data.total_devices,
            active_devices: data.active_devices,
            // Add empty alerts array as fallback
            alert: []
        };
        
        setDeviceData(deviceData);
        } else {
          console.log('Device not found in dashboard data');
        setError('Device not found');
        }
      }
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError('Failed to load device data. Please try again later.');
      showError('Failed to load device data');
    } finally {
      setLoading(false);
    }
  }, [deviceId, authenticatedAdminFetch, showError]);

  // Helper function to format Firestore timestamps
  const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp) {
      console.warn('No timestamp provided');
      return new Date();
    }
    
    console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp);
    
    // Firestore timestamp object
    if (timestamp.type === 'firestore/timestamp/1.0' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Generic object with seconds property
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // ISO string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Unix timestamp (number)
    if (typeof timestamp === 'number') {
      // Check if it's in seconds or milliseconds
      if (timestamp < 10000000000) {
        // Likely in seconds
        return new Date(timestamp * 1000);
      } else {
        // Likely in milliseconds
        return new Date(timestamp);
      }
    }
    
    // Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    console.warn('Unable to parse timestamp:', timestamp);
    return new Date();
  };

  // Get status color for styling
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'active':
        return 'status-active';
      case 'inactive':
      case 'offline':
        return 'status-offline';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-unknown';
    }
  };

  // Get formatted status text with proper capitalization
  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Generate technical metrics data for charts
  const getTechnicalMetrics = (timeFilter, metricType) => {
    const dataTemplates = {
      daily: [
        { period: '00:00', hour: '00:00' },
        { period: '04:00', hour: '04:00' },
        { period: '08:00', hour: '08:00' },
        { period: '12:00', hour: '12:00' },
        { period: '16:00', hour: '16:00' },
        { period: '20:00', hour: '20:00' },
        { period: '23:59', hour: '23:59' }
      ],
      weekly: [
        { period: 'Mon', hour: 'Monday' },
        { period: 'Tue', hour: 'Tuesday' },
        { period: 'Wed', hour: 'Wednesday' },
        { period: 'Thu', hour: 'Thursday' },
        { period: 'Fri', hour: 'Friday' },
        { period: 'Sat', hour: 'Saturday' },
        { period: 'Sun', hour: 'Sunday' }
      ],
      monthly: [
        { period: 'Week 1', hour: 'Week 1' },
        { period: 'Week 2', hour: 'Week 2' },
        { period: 'Week 3', hour: 'Week 3' },
        { period: 'Week 4', hour: 'Week 4' }
      ],
      total: [
        { period: 'Jan', hour: 'January' },
        { period: 'Feb', hour: 'February' },
        { period: 'Mar', hour: 'March' },
        { period: 'Apr', hour: 'April' },
        { period: 'May', hour: 'May' },
        { period: 'Jun', hour: 'June' }
      ]
    };

    const metricData = {
      temperature: {
        daily: [26.5, 28.2, 29.8, 32.1, 30.5, 28.9, 27.2],
        weekly: [28.5, 29.2, 30.1, 31.5, 32.8, 29.9, 27.8],
        monthly: [29.2, 30.5, 31.1, 29.8],
        total: [28.5, 29.8, 30.2, 29.1, 30.8, 29.5]
      },
      voltage: {
        daily: [24.1, 24.3, 24.5, 24.2, 23.9, 24.1, 24.2],
        weekly: [24.2, 24.1, 24.3, 24.0, 24.4, 24.2, 24.1],
        monthly: [24.2, 24.1, 24.3, 24.2],
        total: [24.1, 24.3, 24.2, 24.0, 24.4, 24.2]
      },
      energy: {
        daily: [0, 8.2, 24.5, 78.4, 124.7, 142.3, 156.8],
        weekly: [145.2, 162.8, 156.4, 178.9, 201.3, 134.7, 118.5],
        monthly: [1087, 1156, 1201, 1268],
        total: [4500, 5200, 4800, 5100, 5600, 5300]
      },
      current: {
        daily: [11.2, 12.8, 13.5, 13.8, 13.1, 12.9, 13.3],
        weekly: [13.1, 13.4, 12.9, 13.6, 14.2, 12.8, 11.9],
        monthly: [13.2, 13.5, 13.8, 13.4],
        total: [12.8, 13.1, 13.5, 13.2, 13.8, 13.4]
      }
    };

    return dataTemplates[timeFilter].map((template, index) => ({
      ...template,
      value: metricData[metricType][timeFilter][index]
    }));
  };

  // Generate transaction data (payment-only system)
  const getTransactionData = (timeFilter) => {
    const baseData = {
      daily: [
        { period: '00:00', transactions: 0, revenue: 0, sessions: 0 },
        { period: '04:00', transactions: 2, revenue: 125, sessions: 2 },
        { period: '08:00', transactions: 8, revenue: 380, sessions: 8 },
        { period: '12:00', transactions: 22, revenue: 1170, sessions: 22 },
        { period: '16:00', transactions: 35, revenue: 1865, sessions: 35 },
        { period: '20:00', transactions: 41, revenue: 2130, sessions: 41 },
        { period: '23:59', transactions: 45, revenue: 2340, sessions: 45 }
      ],
      weekly: [
        { period: 'Mon', transactions: 42, revenue: 2180, sessions: 42 },
        { period: 'Tue', transactions: 48, revenue: 2440, sessions: 48 },
        { period: 'Wed', transactions: 45, revenue: 2350, sessions: 45 },
        { period: 'Thu', transactions: 52, revenue: 2680, sessions: 52 },
        { period: 'Fri', transactions: 58, revenue: 3020, sessions: 58 },
        { period: 'Sat', transactions: 38, revenue: 2020, sessions: 38 },
        { period: 'Sun', transactions: 32, revenue: 1780, sessions: 32 }
      ],
      monthly: [
        { period: 'Week 1', transactions: 312, revenue: 16300, sessions: 312 },
        { period: 'Week 2', transactions: 335, revenue: 17340, sessions: 335 },
        { period: 'Week 3', transactions: 348, revenue: 18015, sessions: 348 },
        { period: 'Week 4', transactions: 365, revenue: 19020, sessions: 365 }
      ],
      total: [
        { period: 'Jan', transactions: 1250, revenue: 65000, sessions: 1250 },
        { period: 'Feb', transactions: 1380, revenue: 72000, sessions: 1380 },
        { period: 'Mar', transactions: 1420, revenue: 74000, sessions: 1420 },
        { period: 'Apr', transactions: 1350, revenue: 70000, sessions: 1350 },
        { period: 'May', transactions: 1480, revenue: 77000, sessions: 1480 },
        { period: 'Jun', transactions: 1400, revenue: 73000, sessions: 1400 }
      ]
    };
    
    return baseData[timeFilter];
  };

  const getMetricInfo = (metricType) => {
    const metricConfig = {
      temperature: { 
        label: 'Temperature', 
        unit: '°C', 
        color: '#f59e0b', 
        icon: <Thermometer className="w-4 h-4" />,
        description: 'Device operating temperature over time'
      },
      voltage: { 
        label: 'Voltage', 
        unit: 'V', 
        color: '#3b82f6', 
        icon: <Zap className="w-4 h-4" />,
        description: 'System voltage levels over time'
      },
      energy: { 
        label: 'Energy Accumulated', 
        unit: 'kWh', 
        color: '#10b981', 
        icon: <Battery className="w-4 h-4" />,
        description: 'Cumulative energy generation over time'
      },
      current: { 
        label: 'Current', 
        unit: 'A', 
        color: '#8b5cf6', 
        icon: <Activity className="w-4 h-4" />,
        description: 'System current draw over time'
      }
    };
    return metricConfig[metricType];
  };

  // Fetch data when component mounts or deviceId changes
  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  // Fetch device information from API or use a more comprehensive mapping
  const getDeviceInfo = (deviceId) => {
    // Try to get device info from device data first (from dashboard API)
    if (deviceData) {
      return {
        name: deviceData.name || `Device ${deviceId}`,
        location: deviceData.location || "QCU Campus",
        building: deviceData.building || "Main Building",
        status: deviceData.status || "active"
      };
    }

    // Try to get device info from fetched device info (from dashboard API)
    if (deviceInfo) {
      return {
        name: deviceInfo.name || `Device ${deviceId}`,
        location: deviceInfo.location || "QCU Campus",
        building: deviceInfo.building || "Main Building",
        status: deviceInfo.status || "active"
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

  // Calculate energy from energy_history for this specific device
  const calculateEnergyFromHistory = (timeFilter) => {
    if (!deviceData?.energy_history || !Array.isArray(deviceData.energy_history) || deviceData.energy_history.length === 0) {
      return 0;
    }

    const now = new Date();
    let startDate;

    switch (timeFilter) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'total':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(0);
    }

    // Flatten the energy_history array (it's nested)
    const allEnergyData = deviceData.energy_history.flat();
    
    // Filter by device_id first, then by time period
    const filteredData = allEnergyData.filter(entry => {
      // First check if this entry belongs to the current device
      if (entry.device_id !== deviceId) return false;
      
      // Then check if it has required data
      if (!entry.date_time || !entry.energy_accumulated) return false;
      
      // Finally check time period
      let entryDate;
      if (entry.date_time.seconds) {
        entryDate = new Date(entry.date_time.seconds * 1000);
      } else {
        entryDate = new Date(entry.date_time);
      }
      
      return entryDate >= startDate;
    });

    // Calculate total energy accumulated for this device only
    const totalEnergy = filteredData.reduce((sum, entry) => {
      return sum + (entry.energy_accumulated || 0);
    }, 0);

    console.log(`Energy calculation for device ${deviceId}, period ${timeFilter}:`, {
      totalEntries: allEnergyData.length,
      deviceEntries: allEnergyData.filter(e => e.device_id === deviceId).length,
      filteredEntries: filteredData.length,
      totalEnergy: totalEnergy
    });

    return totalEnergy;
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
       // Calculate device-specific revenue from transactions
       const deviceTransactions = deviceData.transactions?.filter(t => t.device_id === deviceId) || [];
       const deviceRevenue = deviceTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
       
       // Calculate device-specific uses (number of transactions)
       const deviceUses = deviceTransactions.length;
       
       // Calculate device-specific energy from history
       const deviceEnergy = calculateEnergyFromHistory(timeFilter);
      
      return {
         revenue: `₱${deviceRevenue}`,
         uses: deviceUses,
         energy: `${deviceEnergy.toFixed(1)}kWh`,
         sessions: deviceTransactions.length
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

  // Format sessions from API transactions for this specific device
  const getRecentSessions = () => {
    if (!deviceData?.transactions) {
      return [
    {
      id: "S001",
       user: "Unknown User",
       station: deviceId,
      amount: "₱25.00",
       type: "payment",
       time: "2:30 PM • 45 min"
        }
      ];
    }

    // Filter transactions by device_id
    const deviceTransactions = deviceData.transactions.filter(transaction => transaction.device_id === deviceId);

    return deviceTransactions.map((transaction, index) => {
      // Debug: Log transaction structure
      console.log('Transaction data:', transaction);
      
      // Try different timestamp fields
      let dateTime;
      if (transaction.date_time) {
        dateTime = formatFirestoreTimestamp(transaction.date_time);
      } else if (transaction.timestamp) {
        dateTime = formatFirestoreTimestamp(transaction.timestamp);
      } else if (transaction.time) {
        dateTime = formatFirestoreTimestamp(transaction.time);
      } else if (transaction.created_at) {
        dateTime = formatFirestoreTimestamp(transaction.created_at);
      } else {
        // Generate a realistic date based on transaction index (recent transactions)
        const now = new Date();
        const hoursAgo = index * 2; // Each transaction is 2 hours apart
        dateTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
        console.warn('No timestamp found for transaction, using generated date:', dateTime);
      }
      
      // Calculate duration based on amount * 10 minutes
      const duration = Math.round((transaction.amount || 0) * 10);
      const durationText = duration > 0 ? `${duration} min` : "Free";

      return {
        id: transaction.transaction_id || transaction.id || `T${index + 1}`,
        user: "Unknown User",
        station: transaction.station || transaction.device_id || deviceId,
        amount: transaction.amount > 0 ? `₱${transaction.amount}` : "Free",
        type: transaction.amount > 0 ? "payment" : "rfid",
        time: `${dateTime.toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })} • ${durationText}`
      };
    });
  };

  const recentSessions = getRecentSessions();

  // Filter and sort sessions based on selected filter
  const getFilteredSessions = () => {
    const sessions = getRecentSessions();
    
    switch (sessionsFilter) {
      case 'newest':
        return sessions.sort((a, b) => {
          // Parse the time string to compare dates
          const dateA = new Date(a.time.split(' • ')[0]);
          const dateB = new Date(b.time.split(' • ')[0]);
          return dateB - dateA; // Newest first
        });
      case 'oldest':
        return sessions.sort((a, b) => {
          const dateA = new Date(a.time.split(' • ')[0]);
          const dateB = new Date(b.time.split(' • ')[0]);
          return dateA - dateB; // Oldest first
        });
      case 'highest':
        return sessions.sort((a, b) => {
          // Extract numeric value from amount string
          const getAmountValue = (amountStr) => {
            if (!amountStr) return 0;
            // Remove ₱ symbol and any commas, then parse
            const cleanAmount = amountStr.toString().replace(/[₱,]/g, '').trim();
            const parsed = parseFloat(cleanAmount);
            return isNaN(parsed) ? 0 : parsed;
          };
          
          const amountA = getAmountValue(a.amount);
          const amountB = getAmountValue(b.amount);
          return amountB - amountA; // Highest first
        });
      default:
        return sessions;
    }
  };

  // Get threat level styling
  const getThreatLevelInfo = (threat) => {
    const threatLevels = {
      0: { label: "No Threat", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)", icon: "✓" },
      1: { label: "Low", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)", icon: "ℹ" },
      2: { label: "Medium", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)", icon: "⚠" },
      3: { label: "High", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)", icon: "⚠" },
      4: { label: "Critical", color: "#dc2626", bgColor: "rgba(220, 38, 38, 0.1)", icon: "🚨" }
    };
    return threatLevels[threat] || threatLevels[0];
  };

  // Get alerts from API data for this specific device
  const getAlerts = () => {
    if (!deviceData?.alerts || !Array.isArray(deviceData.alerts)) {
      return [];
    }

    // Filter alerts by device_id
    const deviceAlerts = deviceData.alerts.filter(alert => alert.device_id === deviceId);

    return deviceAlerts.map((alert, index) => {
      const threatInfo = getThreatLevelInfo(alert.threat);
      return {
        id: `alert-${index}`,
        content: alert.content,
        threat: alert.threat,
        threatInfo: threatInfo,
        time: "Recent" // You can add timestamp parsing if needed
      };
    });
  };

  const alerts = getAlerts();

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

  // Show loading state
  if (loading) {
    return (
      <div id="device-detail">
        <AdminHeader 
          title="Loading device..."
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
        title={`${device.name} (${device.id})`}
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
                <div className={`status-badge ${getStatusColor(device.status)}`}>
                {getStatusText(device.status)}
                </div>
                <span className="device-id-badge">
                  {device.id}
                </span>
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
                      <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
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

              {/* Active Alerts */}
                <div className="realtime-card">
                  <div className="realtime-card-header">
                    <h3 className="realtime-card-title">
                      <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                     <span>Device Alerts</span>
                    </h3>
                  </div>
                  <div className="realtime-card-content">
                    {alerts.length > 0 ? (
                  <div className="alerts-list">
                    {alerts.map((alert) => (
                       <div key={alert.id} className="alert-item" style={{
                         borderLeft: `4px solid ${alert.threatInfo.color}`,
                         backgroundColor: alert.threatInfo.bgColor
                       }}>
                           <div className="alert-icon" style={{
                             backgroundColor: alert.threatInfo.bgColor,
                             color: alert.threatInfo.color,
                             width: '2rem',
                             height: '2rem',
                             borderRadius: '50%',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             fontSize: '1rem',
                             fontWeight: 'bold'
                           }}>
                             {alert.threatInfo.icon}
                          </div>
                        <div className="alert-content">
                           <div className="alert-message" style={{ 
                             color: '#ffffff', 
                             fontWeight: '500',
                             marginBottom: '0.25rem'
                           }}>
                             {alert.content}
                        </div>
                           <div className="alert-time" style={{ 
                             color: '#9ca3af', 
                             fontSize: '0.875rem' 
                           }}>
                             {alert.time}
                           </div>
                         </div>
                           <span className="alert-severity" style={{
                             backgroundColor: alert.threatInfo.color,
                             color: '#ffffff',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '0.375rem',
                             fontSize: '0.75rem',
                             fontWeight: '600',
                             textTransform: 'uppercase'
                           }}>
                           {alert.threatInfo.label}
                          </span>
                      </div>
                    ))}
                  </div>
                    ) : (
                       <div className="no-alerts" style={{
                         textAlign: 'center',
                         padding: '2rem',
                         color: '#9ca3af'
                       }}>
                         <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
                         <p>No active alerts for this device</p>
              </div>
            )}
                  </div>
                </div>
              </div>
          </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="tab-content">
            <div className="sessions-card">
                <div className="sessions-header">
                  <div>
                    <h3 className="sessions-title">
                      <History className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      Recent Charging Sessions
                    </h3>
                    <p className="sessions-description">Latest user sessions and transactions</p>
                  </div>
                  <div className="sessions-filter">
                    <select 
                      value={sessionsFilter} 
                      onChange={(e) => setSessionsFilter(e.target.value)}
                      className="sessions-filter-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Amount</option>
                    </select>
                  </div>
              </div>
                <div className="sessions-content">
                <div className="sessions-list">
                  {getFilteredSessions().map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-info">
                          <div className={`session-icon ${session.type}`}>
                          {session.type === 'rfid' ? (
                              <Clock className="w-4 h-4" />
                          ) : (
                              <Coins className="w-4 h-4" style={{ color: '#fbbf24' }} />
                          )}
                        </div>
                          <div className="session-details">
                          <div className="session-user">{session.user}</div>
                            <div className="session-meta">
                            Station {session.station} • {session.time}
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
                    <h3 className="maintenance-title">
                      <Wrench className="w-5 h-5" style={{ color: '#10b981' }} />
                      Maintenance Schedule
                    </h3>
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
                    <h3 className="maintenance-title">
                      <Info className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                      Device Information
                    </h3>
                </div>
                  <div className="maintenance-content">
                    <div className="device-info-list">
                      <div className="device-info-item">
                        <span className="device-info-label">Installation Date</span>
                        <span className="device-info-value">2024-01-15</span>
                    </div>
                      <div className="device-info-item">
                        <span className="device-info-label">Hardware Version</span>
                        <span className="device-info-value">ECS-Gen2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Enhanced Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content">
              {/* Time Filter */}
              <div className="analytics-filter" style={{ 
                marginBottom: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff', marginLeft: '2rem' }}>
                  Analytics
                </div>
                <div className="time-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2rem' }}>
                  <span className="time-filter-label" style={{ fontSize: '1rem', fontWeight: '500', color: '#9ca3af' }}>Time Period:</span>
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
              </div>
              
              {/* Summary Cards */}
              <div className="analytics-grid" style={{ marginBottom: '0.5rem' }}>
              <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title">
                      <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
                      Energy Generated ({timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)})
                    </h3>
                </div>
                  <div className="analytics-content">
                    <div className="analytics-metric">
                       <div className="analytics-value energy">{calculateEnergyFromHistory(timeFilter).toFixed(1)}kWh</div>
                      <div className="analytics-trend positive">
                        <span>↗</span>
                        <span>+12.5% vs prev period</span>
                      </div>
                    </div>
                    <div className="analytics-icon energy">⚡</div>
                      </div>
                    </div>
                    
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title">
                      <DollarSign className="w-5 h-5" style={{ color: '#10b981' }} />
                      Revenue ({timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)})
                    </h3>
                  </div>
                  <div className="analytics-content">
                    <div className="analytics-metric">
                       <div className="analytics-value revenue">₱{(() => {
                         const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                         return deviceTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                       })()}</div>
                      <div className="analytics-trend positive">
                        <span>↗</span>
                        <span>+8.3% vs prev period</span>
                      </div>
                    </div>
                    <div className="analytics-icon revenue">$</div>
                      </div>
                    </div>
                    
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title">
                      <Users className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      Uses ({timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)})
                    </h3>
                      </div>
                  <div className="analytics-content">
                    <div className="analytics-metric">
                       <div className="analytics-value uses">{(() => {
                         const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                         return deviceTransactions.length;
                       })()}</div>
                      <div className="analytics-trend positive">
                        <span>↗</span>
                        <span>+15.2% vs prev period</span>
                    </div>
                    </div>
                    <div className="analytics-icon uses">👥</div>
                  </div>
                </div>
              </div>

              {/* Two Charts in One Row */}
              <div className="analytics-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Chart 1: Technical Metrics */}
              <div className="analytics-card">
                  <div className="analytics-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '600' }}>
                        <div style={{ fontSize: '1.5rem', color: getMetricInfo(selectedMetric).color }}>{getMetricInfo(selectedMetric).icon}</div>
                        <span>Technical Metrics</span>
                      </h3>
                      <select 
                        value={selectedMetric} 
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid #374151',
                          backgroundColor: '#1f2937',
                          color: '#ffffff',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="temperature">Temperature</option>
                        <option value="voltage">Voltage</option>
                        <option value="energy">Energy Accumulated</option>
                        <option value="current">Current</option>
                      </select>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                      {getMetricInfo(selectedMetric).description}
                    </p>
                  </div>
                  <div className="analytics-content">
                    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getMetricInfo(selectedMetric).color }}>
                        {getMetricInfo(selectedMetric).label} Chart
                      </div>
                      <div style={{ fontSize: '1rem', color: '#9ca3af' }}>
                        {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} {getMetricInfo(selectedMetric).label.toLowerCase()} data
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {getTechnicalMetrics(timeFilter, selectedMetric).map((point, index) => (
                          <div key={index} style={{ 
                            padding: '0.5rem', 
                            backgroundColor: '#374151', 
                            borderRadius: '0.375rem',
                            textAlign: 'center',
                            minWidth: '80px'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{point.period}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: getMetricInfo(selectedMetric).color }}>
                              {point.value} {getMetricInfo(selectedMetric).unit}
                      </div>
                          </div>
                        ))}
                      </div>
                    </div>
                      </div>
                </div>
                    
                {/* Chart 2: Revenue & Usage Trends */}
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h3 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '600' }}>
                      <DollarSign className="w-6 h-6" style={{ color: '#10b981' }} />
                      <span>Revenue & Usage Trends</span>
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                      Payment revenue and usage patterns over {timeFilter} period
                    </p>
                  </div>
                  <div className="analytics-content">
                    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        Revenue & Usage Chart
                    </div>
                      <div style={{ fontSize: '1rem', color: '#9ca3af' }}>
                        {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} transaction data
                    </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {getTransactionData(timeFilter).map((point, index) => (
                          <div key={index} style={{ 
                            padding: '0.5rem', 
                            backgroundColor: '#374151', 
                            borderRadius: '0.375rem',
                            textAlign: 'center',
                            minWidth: '100px'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{point.period}</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981' }}>
                              ₱{point.revenue}
                    </div>
                            <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>
                              {point.sessions} sessions
                  </div>
                          </div>
                        ))}
                      </div>
                    </div>
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


