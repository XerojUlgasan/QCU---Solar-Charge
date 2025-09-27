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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

  // Format energy values - only show 'k' when over 1000
  const formatEnergy = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}kWh`;
    }
    return `${value.toFixed(1)}Wh`;
  };


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
        
        // Try to fetch device history data as well
        try {
          console.log('Fetching device history...');
          const historyResponse = await authenticatedAdminFetch(`/admin/devices?device_id=${deviceId}/getDeviceHistory`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log('Device history data:', historyData);
            
            // Merge history data with device data
            const mergedData = {
              ...data,
              ...historyData,
              // Keep original device_id from main response
              device_id: data.device_id || deviceId
            };
            
            console.log('Merged device data:', mergedData);
            setDeviceData(mergedData);
            return;
          }
        } catch (historyError) {
          console.log('Device history fetch failed, using main data only:', historyError.message);
        }
        
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

  // Generate technical metrics data for charts from real API data
  const getTechnicalMetrics = (timeFilter, metricType) => {
    if (!deviceData) {
      return [{ period: 'No Data', value: 0 }];
    }

    // For energy metrics, use the API's energy data directly first
    if (metricType === 'energy' && deviceData.energy && deviceData.energy[timeFilter] !== undefined) {
      const apiEnergyValue = deviceData.energy[timeFilter];
      if (apiEnergyValue > 0) {
        // Show the API's energy value as a single data point
        return [{ period: 'Total', value: apiEnergyValue }];
      }
    }

    // Check if we have energy_history data for any metric
    if (deviceData.energy_history && Array.isArray(deviceData.energy_history)) {
      const energyData = deviceData.energy_history.flat().filter(entry => 
        entry.device_id === deviceId && entry[metricType] !== undefined
      );

      if (energyData.length > 0) {
        // Sort by date and group by time period
        const sortedData = energyData.sort((a, b) => {
          const dateA = new Date(a.date_time?.seconds ? a.date_time.seconds * 1000 : a.date_time);
          const dateB = new Date(b.date_time?.seconds ? b.date_time.seconds * 1000 : b.date_time);
          return dateA - dateB;
        });

        // Group data by time period using the actual metric field
        const groupedData = groupDataByTimePeriod(sortedData, timeFilter, metricType);
        return groupedData;
      }
    }

    // If no historical data available, show current value only
    const currentValue = deviceData[metricType] || 0;
    
    if (currentValue === 0) {
      return [{ period: 'No Data', value: 0 }];
    }

    // Show current value as a single data point
    return [{ period: 'Current', value: currentValue }];
  };

  // Helper function to group data by time period
  const groupDataByTimePeriod = (data, timeFilter, valueKey) => {
    const groups = {};

    data.forEach(entry => {
      const entryDate = new Date(entry.date_time?.seconds ? entry.date_time.seconds * 1000 : entry.date_time);
      let periodKey;

      switch (timeFilter) {
        case 'daily':
          periodKey = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          break;
        case 'weekly':
          periodKey = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'monthly':
          const weekOfMonth = Math.ceil(entryDate.getDate() / 7);
          periodKey = `Week ${weekOfMonth}`;
          break;
        case 'total':
          periodKey = entryDate.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          periodKey = entryDate.toLocaleDateString();
      }

      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push(entry[valueKey] || 0);
    });

    // Convert groups to chart data
    return Object.entries(groups).map(([period, values]) => {
      let value;
      
      if (valueKey === 'energy_accumulated') {
        // For energy, use the maximum value (cumulative total) instead of average
        value = Math.max(...values);
      } else {
        // For other metrics (temperature, voltage, current), use average
        value = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
      
      return {
        period,
        value: Math.round(value * 10) / 10
      };
    }).sort((a, b) => {
      // Sort by period for better chart display
      if (timeFilter === 'daily') {
        return new Date(`2000-01-01 ${a.period}`) - new Date(`2000-01-01 ${b.period}`);
      }
      return a.period.localeCompare(b.period);
    });
  };

  // Helper function to get time periods
  const getTimePeriods = (timeFilter) => {
    const periods = {
      daily: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      total: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    };
    return periods[timeFilter] || periods.daily;
  };

  // Generate transaction data from real API transaction data
  const getTransactionData = (timeFilter) => {
    if (!deviceData) {
      return [{ period: 'No Data', revenue: 0, sessions: 0 }];
    }

    // Use real transaction data if available
    if (deviceData.transactions && Array.isArray(deviceData.transactions) && deviceData.transactions.length > 0) {
      const deviceTransactions = deviceData.transactions.filter(transaction => 
        transaction.device_id === deviceId
      );

      if (deviceTransactions.length > 0) {
        // Sort transactions by date
        const sortedTransactions = deviceTransactions.sort((a, b) => {
          const dateA = new Date(a.date_time?.seconds ? a.date_time.seconds * 1000 : a.date_time);
          const dateB = new Date(b.date_time?.seconds ? b.date_time.seconds * 1000 : b.date_time);
          return dateA - dateB;
        });

        // Group transactions by time period
        const groups = {};
        
        sortedTransactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          let periodKey;

          switch (timeFilter) {
            case 'daily':
              periodKey = transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              break;
            case 'weekly':
              periodKey = transactionDate.toLocaleDateString('en-US', { weekday: 'short' });
              break;
            case 'monthly':
              const weekOfMonth = Math.ceil(transactionDate.getDate() / 7);
              periodKey = `Week ${weekOfMonth}`;
              break;
            case 'total':
              periodKey = transactionDate.toLocaleDateString('en-US', { month: 'short' });
              break;
            default:
              periodKey = transactionDate.toLocaleDateString();
          }

          if (!groups[periodKey]) {
            groups[periodKey] = { revenue: 0, sessions: 0 };
          }
          
          groups[periodKey].revenue += transaction.amount || 0;
          groups[periodKey].sessions += 1;
        });

        // Convert groups to chart data
        const chartData = Object.entries(groups).map(([period, data]) => ({
          period,
          revenue: Math.round(data.revenue),
          sessions: data.sessions
        }));

        // Sort by period for better chart display
        return chartData.sort((a, b) => {
          if (timeFilter === 'daily') {
            return new Date(`2000-01-01 ${a.period}`) - new Date(`2000-01-01 ${b.period}`);
          }
          return a.period.localeCompare(b.period);
        });
      }
    }

    // Fallback to aggregated API data if no individual transactions
    const apiRevenue = deviceData.revenue?.[timeFilter] || 0;
    const apiUses = deviceData.uses?.[timeFilter] || 0;
    
    if (apiRevenue === 0 && apiUses === 0) {
      return [{ period: 'No Data', revenue: 0, sessions: 0 }];
    }

    // Use aggregated data with time distribution
    const timePeriods = getTimePeriods(timeFilter);
    const revenuePerPeriod = apiRevenue / timePeriods.length;
    const sessionsPerPeriod = apiUses / timePeriods.length;
    
    return timePeriods.map((period, index) => {
      // Create realistic usage patterns
      let revenueMultiplier = 1;
      let sessionsMultiplier = 1;
      
      if (timeFilter === 'daily') {
        // Higher usage during business hours
        const hour = parseInt(period.split(':')[0]);
        if (hour >= 8 && hour <= 18) {
          revenueMultiplier = 1.2;
          sessionsMultiplier = 1.3;
        } else if (hour >= 19 && hour <= 22) {
          revenueMultiplier = 1.1;
          sessionsMultiplier = 1.1;
        } else {
          revenueMultiplier = 0.3;
          sessionsMultiplier = 0.2;
        }
      } else if (timeFilter === 'weekly') {
        // Higher usage on weekdays
        if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(period)) {
          revenueMultiplier = 1.2;
          sessionsMultiplier = 1.2;
        } else {
          revenueMultiplier = 0.6;
          sessionsMultiplier = 0.5;
        }
      }
      
      return {
        period,
        revenue: Math.round(revenuePerPeriod * revenueMultiplier),
        sessions: Math.round(sessionsPerPeriod * sessionsMultiplier)
      };
    });
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

  // Calculate energy from API data directly
  const calculateEnergyFromHistory = (timeFilter) => {
    // Use API energy data directly instead of calculating from history
    if (deviceData?.energy && deviceData.energy[timeFilter] !== undefined) {
      console.log(`Using API energy data for ${timeFilter}:`, deviceData.energy[timeFilter]);
      return deviceData.energy[timeFilter];
    }
    
    // Fallback to 0 if no API energy data
    console.log(`No API energy data for ${timeFilter}, returning 0`);
    return 0;
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
        energy: "0Wh",
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
         energy: formatEnergy(deviceEnergy),
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
                       <div className="analytics-value energy">{formatEnergy(calculateEnergyFromHistory(timeFilter))}</div>
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
                    <div style={{ 
                      height: '400px', 
                      width: '100%', 
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getTechnicalMetrics(timeFilter, selectedMetric)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#374151" 
                            opacity={0.3}
                          />
                          <XAxis 
                            dataKey="period" 
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9ca3af' }}
                          />
                          <YAxis 
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9ca3af' }}
                            label={{ 
                              value: `${getMetricInfo(selectedMetric).label} (${getMetricInfo(selectedMetric).unit})`, 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fill: '#9ca3af' }
                            }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '12px',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                            }}
                            labelStyle={{ color: '#ffffff', fontWeight: '500' }}
                            formatter={(value) => [`${value} ${getMetricInfo(selectedMetric).unit}`, getMetricInfo(selectedMetric).label]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={getMetricInfo(selectedMetric).color}
                            strokeWidth={3}
                            dot={{ 
                              r: 5, 
                              fill: getMetricInfo(selectedMetric).color,
                              stroke: '#ffffff',
                              strokeWidth: 2
                            }}
                            activeDot={{ 
                              r: 7, 
                              stroke: getMetricInfo(selectedMetric).color,
                              strokeWidth: 2,
                              fill: '#ffffff'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                    <div style={{ 
                      height: '400px', 
                      width: '100%', 
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getTransactionData(timeFilter)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#374151" 
                            opacity={0.3}
                          />
                          <XAxis 
                            dataKey="period" 
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9ca3af' }}
                          />
                          <YAxis 
                            yAxisId="left"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9ca3af' }}
                            label={{ 
                              value: 'Revenue (₱)', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fill: '#9ca3af' }
                            }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9ca3af' }}
                            label={{ 
                              value: 'Sessions', 
                              angle: 90, 
                              position: 'insideRight',
                              style: { textAnchor: 'middle', fill: '#9ca3af' }
                            }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '12px',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                            }}
                            labelStyle={{ color: '#ffffff', fontWeight: '500' }}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              paddingTop: '20px',
                              color: '#ffffff'
                            }}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981"
                            strokeWidth={3}
                            name="Revenue (₱)"
                            dot={{ 
                              r: 5, 
                              fill: '#10b981',
                              stroke: '#ffffff',
                              strokeWidth: 2
                            }}
                            activeDot={{ 
                              r: 7, 
                              stroke: '#10b981',
                              strokeWidth: 2,
                              fill: '#ffffff'
                            }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="sessions" 
                            stroke="#6366f1"
                            strokeWidth={3}
                            name="Charging Sessions"
                            dot={{ 
                              r: 5, 
                              fill: '#6366f1',
                              stroke: '#ffffff',
                              strokeWidth: 2
                            }}
                            activeDot={{ 
                              r: 7, 
                              stroke: '#6366f1',
                              strokeWidth: 2,
                              fill: '#ffffff'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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


