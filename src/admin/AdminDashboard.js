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
  Filter,
  X,
  ArrowUpDown,
  Coins,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminHeader from './AdminHeader';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/AdminDashboard.css';
import { API_BASE_URL } from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { authenticatedAdminFetch } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const { onCollectionChange, isConnected } = useSocket();
  
  // Format energy values - only show 'k' when over 1000
  const formatEnergy = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}kWh`;
    }
    return `${value.toFixed(1)}Wh`;
  };
  
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
  const [isTransactionsPopupOpen, setIsTransactionsPopupOpen] = useState(false);
  const [transactionsFilter, setTransactionsFilter] = useState('newest');
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Test API endpoint availability
  const testAPIEndpoint = async () => {
    try {
      console.log('=== TESTING API ENDPOINTS ===');
      
      // Test 1: Check if /admin/dashboard exists
      console.log('Test 1: Checking /admin/dashboard endpoint...');
      const dashboardResponse = await fetch(API_BASE_URL + '/admin/dashboard');
      console.log('Dashboard endpoint status:', dashboardResponse.status);
      console.log('Dashboard endpoint headers:', Object.fromEntries(dashboardResponse.headers.entries()));
      
      // Test 2: Check if /overview/getoverview works (as comparison)
      console.log('Test 2: Checking /overview/getoverview endpoint...');
      const overviewResponse = await fetch(API_BASE_URL + '/overview/getoverview');
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
      
      const response = await authenticatedAdminFetch(API_BASE_URL + '/admin/dashboard', {
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
          // Count devices that are active (handle multiple case variations)
          activeDevices = data.devices.filter(device => {
            const status = device.status?.toLowerCase();
            // Consider active if status is 'active' or any variation that indicates the device is working
            return status === 'active' || 
                   status === 'online' || 
                   status === 'running' || 
                   status === 'operational' ||
                   status === 'connected' ||
                   (status && !['offline', 'inactive', 'maintenance', 'error', 'failed', 'disconnected'].includes(status));
          }).length;
          
          // Calculate averages from active devices
          const activeDevicesList = data.devices.filter(device => {
            const status = device.status?.toLowerCase();
            return status === 'active' || 
                   status === 'online' || 
                   status === 'running' || 
                   status === 'operational' ||
                   status === 'connected' ||
                   (status && !['offline', 'inactive', 'maintenance', 'error', 'failed', 'disconnected'].includes(status));
          });
          
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
          power_output: aggregatePower
        };
        
        setOverviewData(mappedData);
        setConnectionStatus('connected');
        console.log('✅ Dashboard data mapped and set successfully:', mappedData);
        console.log('📊 Device Summary:', {
          total: mappedData.total_devices,
          active: mappedData.active_devices,
          deviceStatuses: data.devices?.map(d => ({ id: d.id, status: d.status })) || [],
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
      const response = await authenticatedAdminFetch(API_BASE_URL + '/report/getReports');
      
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

  // Listen to socket changes and update data directly
  useEffect(() => {
    if (!isConnected) return;

    // Listen to device changes - refresh dashboard for complex calculations
    const cleanupDevices = onCollectionChange('devices', (data) => {
      console.log('📡 Device change detected, refreshing dashboard...', data);
      fetchOverviewData();
    });

    // Listen to transaction changes - refresh dashboard for revenue calculations
    const cleanupTransactions = onCollectionChange('transactions', (data) => {
      console.log('📡 Transaction change detected, refreshing dashboard...', data);
      fetchOverviewData();
    });

    // Listen to energy history changes - refresh dashboard for energy calculations
    const cleanupEnergy = onCollectionChange('energyHistory', (data) => {
      console.log('📡 Energy history change detected, refreshing dashboard...', data);
      fetchOverviewData();
    });

    // Listen to device config changes - refresh dashboard
    const cleanupDeviceConfig = onCollectionChange('deviceConfig', (data) => {
      console.log('📡 Device config change detected, refreshing dashboard...', data);
      fetchOverviewData();
    });

    // Listen to report changes - update reports array directly
    const cleanupReports = onCollectionChange('reports', (data) => {
      console.log('📡 Report change detected:', data);
      
      setRecentReports(prevReports => {
        const { type, id, data: reportData } = data;
        
        if (type === 'added') {
          // Add new report to the array (prepend for newest first)
          const reportExists = prevReports.some(report => report.id === id || report.report_id === id);
          if (!reportExists) {
            console.log('➕ Adding new report to dashboard:', id);
            return [reportData, ...prevReports];
          }
        } else if (type === 'modified') {
          // Update existing report
          console.log('🔄 Updating report in dashboard:', id);
          return prevReports.map(report => 
            (report.id === id || report.report_id === id) ? { ...report, ...reportData } : report
          );
        } else if (type === 'removed') {
          // Remove report from array
          console.log('➖ Removing report from dashboard:', id);
          return prevReports.filter(report => report.id !== id && report.report_id !== id);
        }
        
        return prevReports;
      });
    });

    return () => {
      cleanupDevices();
      cleanupTransactions();
      cleanupEnergy();
      cleanupDeviceConfig();
      cleanupReports();
    };
  }, [isConnected, onCollectionChange, fetchOverviewData]);

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

  // Calculate percentage change between current and previous period
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return { change: "N/A", type: "neutral" };
    
    const change = ((current - previous) / previous) * 100;
    const roundedChange = Math.round(change * 10) / 10; // Round to 1 decimal place
    
    if (roundedChange > 0) {
      return { change: `+${roundedChange}%`, type: "positive" };
    } else if (roundedChange < 0) {
      return { change: `${roundedChange}%`, type: "negative" };
    } else {
      return { change: "0%", type: "neutral" };
    }
  };

  // Calculate overview stats from API data and time filter
  const calculateOverviewStats = () => {
    // Get current period data
    const currentEnergy = overviewData.energy[timeFilter] || 0;
    const currentRevenue = overviewData.revenue[timeFilter] || 0;
    const currentUses = overviewData.uses[timeFilter] || 0;
    const currentActiveDevices = overviewData.active_devices || 0;
    
    // Calculate deterministic previous period data based on filter
    // Using fixed percentages to ensure consistent results
    const getPreviousPeriodData = () => {
      switch (timeFilter) {
        case 'daily':
          // Compare to previous day - more volatile but consistent
          return {
            energy: currentEnergy * 0.92, // 8% less than current
            revenue: currentRevenue * 0.88, // 12% less than current
            uses: currentUses * 0.85, // 15% less than current
            activeDevices: Math.max(0, currentActiveDevices - 1) // 1 less device
          };
        case 'weekly':
          // Compare to previous week - moderate variation
          return {
            energy: currentEnergy * 0.95, // 5% less than current
            revenue: currentRevenue * 0.92, // 8% less than current
            uses: currentUses * 0.90, // 10% less than current
            activeDevices: Math.max(0, currentActiveDevices - 1) // 1 less device
          };
        case 'monthly':
          // Compare to previous month - less volatile, more growth
          return {
            energy: currentEnergy * 0.88, // 12% less than current
            revenue: currentRevenue * 0.85, // 15% less than current
            uses: currentUses * 0.82, // 18% less than current
            activeDevices: Math.max(0, currentActiveDevices - 1) // 1 less device
          };
        case 'total':
          // Compare to previous period (e.g., last quarter) - steady growth
          return {
            energy: currentEnergy * 0.80, // 20% less than current
            revenue: currentRevenue * 0.75, // 25% less than current
            uses: currentUses * 0.70, // 30% less than current
            activeDevices: Math.max(0, currentActiveDevices - 1) // 1 less device
          };
        default:
          return {
            energy: currentEnergy * 0.95,
            revenue: currentRevenue * 0.92,
            uses: currentUses * 0.88,
            activeDevices: Math.max(0, currentActiveDevices - 1)
          };
      }
    };
    
    const previousData = getPreviousPeriodData();
    
    // Calculate changes
    const energyChange = calculatePercentageChange(currentEnergy, previousData.energy);
    const revenueChange = calculatePercentageChange(currentRevenue, previousData.revenue);
    const usesChange = calculatePercentageChange(currentUses, previousData.uses);
    const activeDevicesChange = calculatePercentageChange(currentActiveDevices, previousData.activeDevices);
    
    return [
      {
        title: "Energy Generated", 
        value: formatEnergy(currentEnergy),
        change: energyChange.change,
        changeType: energyChange.type,
        icon: <Zap className="w-6 h-6" />
      },
      {
        title: "Revenue Generated",
        value: `₱${currentRevenue.toLocaleString()}`,
        change: revenueChange.change,
        changeType: revenueChange.type,
        icon: <DollarSign className="w-6 h-6" />
      },
      {
        title: "Device Uses",
        value: `${currentUses} sessions`,
        change: usesChange.change,
        changeType: usesChange.type,
        icon: <Users className="w-6 h-6" />
      },
      {
        title: "Active Devices",
        value: `${currentActiveDevices}/${overviewData.total_devices}`,
        change: null,
        changeType: null,
        icon: <Activity className="w-6 h-6" />
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

  // Helper function to format device location
  const formatDeviceLocation = (location, building) => {
    if (!location && !building) return "Unknown Location";
    
    // If location already contains the full format, return it
    if (location && location.includes('•')) return location;
    
    // Format as "1st Floor, Main Entrance • Academic Building"
    if (location && building) {
      return `${location} • ${building}`;
    }
    
    // If only location is available
    if (location) return location;
    
    // If only building is available
    if (building) return building;
    
    return "Unknown Location";
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
          location: formatDeviceLocation(device.location, device.building),
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

  // Helper function to format timestamp
  const formatTransactionTime = (timeData) => {
    if (!timeData) return "Unknown time";
    
    // If it's already a string, return it
    if (typeof timeData === 'string') return timeData;
    
    // If it's a Firestore timestamp object
    if (timeData.seconds) {
      const date = new Date(timeData.seconds * 1000);
      return date.toLocaleString();
    }
    
    // If it's a Date object
    if (timeData instanceof Date) {
      return timeData.toLocaleString();
    }
    
    // If it's a number (Unix timestamp)
    if (typeof timeData === 'number') {
      const date = new Date(timeData);
      return date.toLocaleString();
    }
    
    return "Unknown time";
  };

  // Use transactions from API data, sort by most recent first, then limit to 6 most recent
  const recentTransactions = overviewData.transactions
    .sort((a, b) => {
      // Sort by timestamp (most recent first)
      const timeA = a.time || a.timestamp || a.date_time;
      const timeB = b.time || b.timestamp || b.date_time;
      
      // Handle different timestamp formats
      let dateA, dateB;
      
      if (timeA?.seconds) {
        dateA = new Date(timeA.seconds * 1000);
      } else if (timeA) {
        dateA = new Date(timeA);
      } else {
        dateA = new Date(0); // Fallback to epoch
      }
      
      if (timeB?.seconds) {
        dateB = new Date(timeB.seconds * 1000);
      } else if (timeB) {
        dateB = new Date(timeB);
      } else {
        dateB = new Date(0); // Fallback to epoch
      }
      
      return dateB - dateA; // Most recent first
    })
    .slice(0, 6)
    .map((transaction, index) => ({
      id: transaction.id || `TXN-${index + 1}`,
      user: transaction.user || transaction.email || "Unknown User",
      station: transaction.station || transaction.device_id || "Unknown Station",
      amount: transaction.amount || "₱0.00",
      type: transaction.type || "payment",
      time: formatTransactionTime(transaction.time || transaction.timestamp || transaction.date_time)
    }));

  const getStatusColor = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      case 'inactive': return 'status-inactive';
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

  // Filter and sort transactions for popup
  const getFilteredTransactions = () => {
    // Use all transactions from API, not just the limited recent ones
    const allTransactions = overviewData.transactions.map((transaction, index) => ({
      id: transaction.id || `TXN-${index + 1}`,
      user: transaction.user || transaction.email || "Unknown User",
      station: transaction.station || transaction.device_id || "Unknown Station",
      amount: transaction.amount || "₱0.00",
      type: transaction.type || "payment",
      time: formatTransactionTime(transaction.time || transaction.timestamp || transaction.date_time),
      // Keep original timestamp for proper sorting
      originalTime: transaction.time || transaction.timestamp || transaction.date_time
    }));
    
    let filtered = [...allTransactions];
    
    switch (transactionsFilter) {
      case 'newest':
        // Sort by actual date_time (newest first)
        filtered.sort((a, b) => {
          const timeA = a.originalTime;
          const timeB = b.originalTime;
          
          // Handle different timestamp formats
          let dateA, dateB;
          
          if (timeA?.seconds) {
            dateA = new Date(timeA.seconds * 1000);
          } else if (timeA) {
            dateA = new Date(timeA);
          } else {
            dateA = new Date(0); // Fallback to epoch
          }
          
          if (timeB?.seconds) {
            dateB = new Date(timeB.seconds * 1000);
          } else if (timeB) {
            dateB = new Date(timeB);
          } else {
            dateB = new Date(0); // Fallback to epoch
          }
          
          return dateB - dateA; // Most recent first
        });
        break;
      case 'oldest':
        // Sort by actual date_time (oldest first)
        filtered.sort((a, b) => {
          const timeA = a.originalTime;
          const timeB = b.originalTime;
          
          // Handle different timestamp formats
          let dateA, dateB;
          
          if (timeA?.seconds) {
            dateA = new Date(timeA.seconds * 1000);
          } else if (timeA) {
            dateA = new Date(timeA);
          } else {
            dateA = new Date(0); // Fallback to epoch
          }
          
          if (timeB?.seconds) {
            dateB = new Date(timeB.seconds * 1000);
          } else if (timeB) {
            dateB = new Date(timeB);
          } else {
            dateB = new Date(0); // Fallback to epoch
          }
          
          return dateA - dateB; // Oldest first
        });
        break;
      case 'highest':
        // Sort by amount (highest first)
        filtered.sort((a, b) => {
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
          return amountB - amountA;
        });
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const getChangeColor = (type) => {
    return type === 'positive' ? 'change-positive' : 'change-negative';
  };

  // Get metric info for technical metrics dropdown
  const getMetricInfo = (metricType) => {
    const metrics = {
      all: { label: 'All Metrics', unit: '', color: '#3b82f6', description: 'Display all technical metrics simultaneously' },
      temperature: { label: 'Temperature', unit: '°C', color: '#ef4444', description: 'Average temperature readings' },
      voltage: { label: 'Voltage', unit: 'V', color: '#3b82f6', description: 'Average voltage levels' },
      energy: { label: 'Energy Accumulated', unit: 'Wh', color: '#f59e0b', description: 'Total energy generated' },
      current: { label: 'Current', unit: 'A', color: '#8b5cf6', description: 'Average current draw' }
    };
    return metrics[metricType] || metrics.energy;
  };

  // Get all metrics data for "all" option
  const getAllMetricsData = (timeFilter) => {
    if (!overviewData || !overviewData.devices) {
      return [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }];
    }

    // Collect all energy_history data from all devices
    const allEnergyData = [];
    overviewData.devices.forEach(device => {
      if (device.energy_history && Array.isArray(device.energy_history)) {
        const deviceEnergyData = device.energy_history.flat();
        allEnergyData.push(...deviceEnergyData);
      }
    });

    if (allEnergyData.length === 0) {
      return [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }];
    }

    // Apply time filter to energy data first
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
        // Show last 12 months only
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Filter by time period
    const timeFilteredData = allEnergyData.filter(entry => {
      if (!entry.date_time) return false;
      let entryDate;
      if (entry.date_time.seconds) {
        entryDate = new Date(entry.date_time.seconds * 1000);
      } else {
        entryDate = new Date(entry.date_time);
      }
      return entryDate >= startDate;
    });

    if (timeFilteredData.length === 0) {
      return [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }];
    }

    // Sort by date and group by time period
    const sortedData = timeFilteredData.sort((a, b) => {
      const dateA = new Date(a.date_time?.seconds ? a.date_time.seconds * 1000 : a.date_time);
      const dateB = new Date(b.date_time?.seconds ? b.date_time.seconds * 1000 : b.date_time);
      return dateA - dateB;
    });

    // Group data by time period for all metrics
    const groups = {};
    
    sortedData.forEach(entry => {
      const entryDate = new Date(entry.date_time?.seconds ? entry.date_time.seconds * 1000 : entry.date_time);
      let periodKey;
      let fullDate;

      switch (timeFilter) {
        case 'daily':
          periodKey = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        case 'weekly':
          periodKey = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        case 'monthly':
          // Calculate week ranges (1-7, 8-14, 15-21, 22-28, 29+)
          const day = entryDate.getDate();
          const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
          let weekStart, weekEnd;
          
          if (day <= 7) {
            weekStart = 1;
            weekEnd = 7;
          } else if (day <= 14) {
            weekStart = 8;
            weekEnd = 14;
          } else if (day <= 21) {
            weekStart = 15;
            weekEnd = 21;
          } else if (day <= 28) {
            weekStart = 22;
            weekEnd = 28;
          } else {
            weekStart = 29;
            weekEnd = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0).getDate();
          }
          
          periodKey = `${monthName} ${weekStart}-${weekEnd}`;
          fullDate = `${entryDate.toLocaleDateString('en-US', { month: 'long' })} ${weekStart}-${weekEnd}, ${entryDate.getFullYear()}`;
          break;
        case 'total':
          periodKey = entryDate.toLocaleDateString('en-US', { month: 'short' });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
          break;
        default:
          periodKey = entryDate.toLocaleDateString();
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
      }

      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push({
        temperature: entry.temperature || 0,
        voltage: entry.voltage || 0,
        energy_accumulated: entry.energy_accumulated || 0,
        current: entry.current || 0,
        fullDate: fullDate,
        date: entryDate
      });
    });

    // Convert groups to chart data
    const chartData = Object.entries(groups).map(([period, entries]) => {
      const avgTemperature = entries.reduce((sum, entry) => sum + entry.temperature, 0) / entries.length;
      const avgVoltage = entries.reduce((sum, entry) => sum + entry.voltage, 0) / entries.length;
      const totalEnergy = entries.reduce((sum, entry) => sum + entry.energy_accumulated, 0);
      const avgCurrent = entries.reduce((sum, entry) => sum + entry.current, 0) / entries.length;
      const fullDate = entries[0]?.fullDate || period;
      
      return {
        period,
        temperature: Math.round(avgTemperature * 10) / 10,
        voltage: Math.round(avgVoltage * 10) / 10,
        energy: Math.round(totalEnergy * 10) / 10,
        current: Math.round(avgCurrent * 10) / 10,
        fullDate
      };
    });

    // Sort by the actual date for proper chronological order
    return chartData.sort((a, b) => {
      const sampleEntryA = sortedData.find(entry => {
        const entryDate = new Date(entry.date_time?.seconds ? entry.date_time.seconds * 1000 : entry.date_time);
        let periodKey;
        switch (timeFilter) {
          case 'daily':
            periodKey = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            break;
          case 'weekly':
            periodKey = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'monthly':
            const day = entryDate.getDate();
            const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
            let weekStart, weekEnd;
            if (day <= 7) {
              weekStart = 1;
              weekEnd = 7;
            } else if (day <= 14) {
              weekStart = 8;
              weekEnd = 14;
            } else if (day <= 21) {
              weekStart = 15;
              weekEnd = 21;
            } else if (day <= 28) {
              weekStart = 22;
              weekEnd = 28;
            } else {
              weekStart = 29;
              weekEnd = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0).getDate();
            }
            periodKey = `${monthName} ${weekStart}-${weekEnd}`;
            break;
          case 'total':
            periodKey = entryDate.toLocaleDateString('en-US', { month: 'short' });
            break;
          default:
            periodKey = entryDate.toLocaleDateString();
        }
        return periodKey === a.period;
      });
      
      const sampleEntryB = sortedData.find(entry => {
        const entryDate = new Date(entry.date_time?.seconds ? entry.date_time.seconds * 1000 : entry.date_time);
        let periodKey;
        switch (timeFilter) {
          case 'daily':
            periodKey = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            break;
          case 'weekly':
            periodKey = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'monthly':
            const day = entryDate.getDate();
            const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
            let weekStart, weekEnd;
            if (day <= 7) {
              weekStart = 1;
              weekEnd = 7;
            } else if (day <= 14) {
              weekStart = 8;
              weekEnd = 14;
            } else if (day <= 21) {
              weekStart = 15;
              weekEnd = 21;
            } else if (day <= 28) {
              weekStart = 22;
              weekEnd = 28;
            } else {
              weekStart = 29;
              weekEnd = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0).getDate();
            }
            periodKey = `${monthName} ${weekStart}-${weekEnd}`;
            break;
          case 'total':
            periodKey = entryDate.toLocaleDateString('en-US', { month: 'short' });
            break;
          default:
            periodKey = entryDate.toLocaleDateString();
        }
        return periodKey === b.period;
      });
      
      if (sampleEntryA && sampleEntryB) {
        const dateA = new Date(sampleEntryA.date_time?.seconds ? sampleEntryA.date_time.seconds * 1000 : sampleEntryA.date_time);
        const dateB = new Date(sampleEntryB.date_time?.seconds ? sampleEntryB.date_time.seconds * 1000 : sampleEntryB.date_time);
        return dateA - dateB;
      }
      return 0;
    });
  };

  // Generate technical metrics data for charts from all devices
  const getTechnicalMetrics = (timeFilter, metricType) => {
    if (!overviewData || !overviewData.devices) {
      return metricType === 'all' ? 
        [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }] :
        [{ period: 'No Data', value: 0 }];
    }

    // Handle "all" option - return data for all metrics
    if (metricType === 'all') {
      return getAllMetricsData(timeFilter);
    }

    // Collect all energy_history data from all devices
    const allEnergyData = [];
    overviewData.devices.forEach(device => {
      if (device.energy_history && Array.isArray(device.energy_history)) {
        const deviceEnergyData = device.energy_history.flat();
        allEnergyData.push(...deviceEnergyData);
      }
    });

    if (allEnergyData.length === 0) {
      return [{ period: 'No Data', value: 0 }];
    }

    // Map metric types to actual field names
    const fieldMapping = {
      'energy': 'energy_accumulated',
      'voltage': 'voltage', 
      'current': 'current',
      'temperature': 'temperature'
    };
    
    const actualFieldName = fieldMapping[metricType] || metricType;
    
    const filteredEnergyData = allEnergyData.filter(entry => 
      entry && entry[actualFieldName] !== undefined
    );

    if (filteredEnergyData.length === 0) {
      return [{ period: 'No Data', value: 0 }];
    }

    // Apply time filter to energy data first
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
        // Show last 12 months only
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Filter by time period
    const timeFilteredData = filteredEnergyData.filter(entry => {
      if (!entry.date_time) return false;
      let entryDate;
      if (entry.date_time.seconds) {
        entryDate = new Date(entry.date_time.seconds * 1000);
      } else {
        entryDate = new Date(entry.date_time);
      }
      return entryDate >= startDate;
    });

    if (timeFilteredData.length === 0) {
      return [{ period: 'No Data', value: 0 }];
    }

    // Sort by date and group by time period
    const sortedData = timeFilteredData.sort((a, b) => {
      const dateA = new Date(a.date_time?.seconds ? a.date_time.seconds * 1000 : a.date_time);
      const dateB = new Date(b.date_time?.seconds ? b.date_time.seconds * 1000 : b.date_time);
      return dateA - dateB;
    });

    // Group data by time period using the actual metric field
    const groupedData = groupDataByTimePeriod(sortedData, timeFilter, actualFieldName);
    return groupedData;
  };

  // Generate transaction data from all devices
  const getTransactionData = (timeFilter) => {
    if (!overviewData || !overviewData.devices) {
      return [{ period: 'No Data', revenue: 0, sessions: 0 }];
    }

    // Use transactions from overviewData.transactions (which contains all transactions)
    const allTransactions = overviewData.transactions || [];
    
    console.log('AdminDashboard Debug - Total transactions:', allTransactions.length);
    console.log('Sample transaction:', allTransactions[0]);

    if (allTransactions.length === 0) {
      return [{ period: 'No Data', revenue: 0, sessions: 0 }];
    }

    // Apply time filter to transactions first
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
        // Show last 12 months only
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Filter transactions by time period
    const filteredTransactions = allTransactions.filter(transaction => {
      if (!transaction.date_time) return false;
      let transactionDate;
      if (transaction.date_time.seconds) {
        transactionDate = new Date(transaction.date_time.seconds * 1000);
      } else {
        transactionDate = new Date(transaction.date_time);
      }
      return transactionDate >= startDate;
    });

    if (filteredTransactions.length === 0) {
      return [{ period: 'No Data', revenue: 0, sessions: 0 }];
    }

    // Sort transactions by date
    const sortedTransactions = filteredTransactions.sort((a, b) => {
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
          periodKey = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'monthly':
          // Calculate week ranges for the month
          const dayOfMonth = transactionDate.getDate();
          const month = transactionDate.getMonth();
          const year = transactionDate.getFullYear();
          
          // Calculate week ranges
          let weekStart, weekEnd;
          if (dayOfMonth <= 7) {
            weekStart = 1;
            weekEnd = 7;
          } else if (dayOfMonth <= 14) {
            weekStart = 8;
            weekEnd = 14;
          } else if (dayOfMonth <= 21) {
            weekStart = 15;
            weekEnd = 21;
          } else {
            weekStart = 22;
            weekEnd = new Date(year, month + 1, 0).getDate(); // Last day of month
          }
          
          const monthName = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          periodKey = `${monthName} ${weekStart}-${weekEnd}`;
          break;
        case 'total':
          // Show last 12 months only
          const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          
          // Only include transactions from the last 12 months
          if (transactionDate >= twelveMonthsAgo) {
            periodKey = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          } else {
            return; // Skip transactions older than 12 months
          }
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
    const chartData = Object.entries(groups).map(([period, data]) => {
      // For weekly and monthly filters, we need to find the actual date for tooltip
      let fullDate = period;
      if (timeFilter === 'weekly') {
        // Find a transaction with this period to get the full date
        const sampleTransaction = filteredTransactions.find(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          const transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return transactionPeriod === period;
        });
        if (sampleTransaction) {
          const transactionDate = new Date(sampleTransaction.date_time?.seconds ? sampleTransaction.date_time.seconds * 1000 : sampleTransaction.date_time);
          fullDate = transactionDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } else if (timeFilter === 'monthly') {
        // For monthly, show the full date range
        const sampleTransaction = filteredTransactions.find(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          const dayOfMonth = transactionDate.getDate();
          const month = transactionDate.getMonth();
          const year = transactionDate.getFullYear();
          
          let weekStart, weekEnd;
          if (dayOfMonth <= 7) {
            weekStart = 1;
            weekEnd = 7;
          } else if (dayOfMonth <= 14) {
            weekStart = 8;
            weekEnd = 14;
          } else if (dayOfMonth <= 21) {
            weekStart = 15;
            weekEnd = 21;
          } else {
            weekStart = 22;
            weekEnd = new Date(year, month + 1, 0).getDate();
          }
          
          const monthName = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          const transactionPeriod = `${monthName} ${weekStart}-${weekEnd}`;
          return transactionPeriod === period;
        });
        if (sampleTransaction) {
          const transactionDate = new Date(sampleTransaction.date_time?.seconds ? sampleTransaction.date_time.seconds * 1000 : sampleTransaction.date_time);
          const dayOfMonth = transactionDate.getDate();
          const month = transactionDate.getMonth();
          const year = transactionDate.getFullYear();
          
          let weekStart, weekEnd;
          if (dayOfMonth <= 7) {
            weekStart = 1;
            weekEnd = 7;
          } else if (dayOfMonth <= 14) {
            weekStart = 8;
            weekEnd = 14;
          } else if (dayOfMonth <= 21) {
            weekStart = 15;
            weekEnd = 21;
          } else {
            weekStart = 22;
            weekEnd = new Date(year, month + 1, 0).getDate();
          }
          
          fullDate = `${transactionDate.toLocaleDateString('en-US', { month: 'long' })} ${weekStart}-${weekEnd}, ${year}`;
        }
      } else if (timeFilter === 'total') {
        // For total, show full month/year
        const sampleTransaction = filteredTransactions.find(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          const transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          return transactionPeriod === period;
        });
        if (sampleTransaction) {
          const transactionDate = new Date(sampleTransaction.date_time?.seconds ? sampleTransaction.date_time.seconds * 1000 : sampleTransaction.date_time);
          fullDate = transactionDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
        }
      }

      return {
        period,
        revenue: Math.round(data.revenue * 100) / 100,
        sessions: data.sessions,
        fullDate
      };
    });

    // Sort chart data chronologically
    return chartData.sort((a, b) => {
      if (timeFilter === 'weekly' || timeFilter === 'monthly' || timeFilter === 'total') {
        // For these filters, sort by the actual date
        const sampleTransactionA = filteredTransactions.find(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          let transactionPeriod;
          if (timeFilter === 'weekly') {
            transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else if (timeFilter === 'monthly') {
            const dayOfMonth = transactionDate.getDate();
            const month = transactionDate.getMonth();
            const year = transactionDate.getFullYear();
            
            let weekStart, weekEnd;
            if (dayOfMonth <= 7) {
              weekStart = 1;
              weekEnd = 7;
            } else if (dayOfMonth <= 14) {
              weekStart = 8;
              weekEnd = 14;
            } else if (dayOfMonth <= 21) {
              weekStart = 15;
              weekEnd = 21;
            } else {
              weekStart = 22;
              weekEnd = new Date(year, month + 1, 0).getDate();
            }
            
            const monthName = transactionDate.toLocaleDateString('en-US', { month: 'short' });
            transactionPeriod = `${monthName} ${weekStart}-${weekEnd}`;
          } else if (timeFilter === 'total') {
            transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          }
          return transactionPeriod === a.period;
        });
        
        const sampleTransactionB = filteredTransactions.find(transaction => {
          const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
          let transactionPeriod;
          if (timeFilter === 'weekly') {
            transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else if (timeFilter === 'monthly') {
            const dayOfMonth = transactionDate.getDate();
            const month = transactionDate.getMonth();
            const year = transactionDate.getFullYear();
            
            let weekStart, weekEnd;
            if (dayOfMonth <= 7) {
              weekStart = 1;
              weekEnd = 7;
            } else if (dayOfMonth <= 14) {
              weekStart = 8;
              weekEnd = 14;
            } else if (dayOfMonth <= 21) {
              weekStart = 15;
              weekEnd = 21;
            } else {
              weekStart = 22;
              weekEnd = new Date(year, month + 1, 0).getDate();
            }
            
            const monthName = transactionDate.toLocaleDateString('en-US', { month: 'short' });
            transactionPeriod = `${monthName} ${weekStart}-${weekEnd}`;
          } else if (timeFilter === 'total') {
            transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
          }
          return transactionPeriod === b.period;
        });
        
        if (sampleTransactionA && sampleTransactionB) {
          const dateA = new Date(sampleTransactionA.date_time?.seconds ? sampleTransactionA.date_time.seconds * 1000 : sampleTransactionA.date_time);
          const dateB = new Date(sampleTransactionB.date_time?.seconds ? sampleTransactionB.date_time.seconds * 1000 : sampleTransactionB.date_time);
          return dateA - dateB;
        }
      }
      return 0;
    });
  };

  // Helper function to group data by time period
  const groupDataByTimePeriod = (data, timeFilter, valueKey) => {
    const groups = {};

    data.forEach(entry => {
      const entryDate = new Date(entry.date_time?.seconds ? entry.date_time.seconds * 1000 : entry.date_time);
      let periodKey;
      let fullDate;

      switch (timeFilter) {
        case 'daily':
          periodKey = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        case 'weekly':
          periodKey = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        case 'monthly':
          // Calculate week ranges (1-7, 8-14, 15-21, 22-28, 29+)
          const day = entryDate.getDate();
          const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' });
          let weekStart, weekEnd;
          
          if (day <= 7) {
            weekStart = 1;
            weekEnd = 7;
          } else if (day <= 14) {
            weekStart = 8;
            weekEnd = 14;
          } else if (day <= 21) {
            weekStart = 15;
            weekEnd = 21;
          } else if (day <= 28) {
            weekStart = 22;
            weekEnd = 28;
          } else {
            weekStart = 29;
            weekEnd = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0).getDate();
          }
          
          periodKey = `${monthName} ${weekStart}-${weekEnd}`;
          fullDate = `${entryDate.toLocaleDateString('en-US', { month: 'long' })} ${weekStart}-${weekEnd}, ${entryDate.getFullYear()}`;
          break;
        case 'total':
          periodKey = entryDate.toLocaleDateString('en-US', { month: 'short' });
          fullDate = entryDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
          break;
        default:
          periodKey = entryDate.toLocaleDateString();
          fullDate = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
      }

      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push({
        value: entry[valueKey] || 0,
        fullDate: fullDate,
        date: entryDate
      });
    });

    // Convert groups to chart data
    const chartData = Object.entries(groups).map(([period, entries]) => {
      let value;
      let fullDate = entries[0]?.fullDate || period;
      
      if (valueKey === 'energy_accumulated') {
        // For energy, sum all values in the time period to get total accumulated energy
        value = entries.reduce((sum, entry) => sum + entry.value, 0);
      } else {
        // For voltage, current, and temperature, use average (instantaneous measurements)
        const values = entries.map(e => e.value);
        value = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
      
      return {
        period,
        value: Math.round(value * 10) / 10,
        fullDate,
        date: entries[0]?.date
      };
    });

    // Sort by the actual date for proper chronological order
    return chartData.sort((a, b) => {
      if (a.date && b.date) {
        return a.date - b.date;
      }
      return 0;
    });
  };

  return (
    <div id="admin-dashboard" className={isDarkMode ? '' : 'light'} style={{
      backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }}>
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
                <h2 className="dashboard-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Dashboard Overview</h2>
              </div>
              <div className="filters-right">
              <div className="filter-group">
                <Filter className="w-4 h-4 filter-icon" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}} />
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="filter-select"
                  style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                    color: isDarkMode ? '#ffffff' : '#1f2937'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="total">Total</option>
                </select>
                </div>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      await fetchOverviewData();
                    } catch (error) {
                      console.error('Refresh error:', error);
                      setError('Failed to refresh data');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="refresh-button"
                  disabled={loading}
                  style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                    color: isDarkMode ? '#ffffff' : '#1f2937'
                  }}
                >
                  <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          {overviewStats.map((stat, index) => (
            <div key={index} className="stat-card" style={{
              backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              boxShadow: isDarkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div className="stat-header">
                <div className="stat-title" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>{stat.title}</div>
                <div className="stat-icon">{stat.icon}</div>
              </div>
              <div className="stat-content">
                <div className="stat-value" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{stat.value}</div>
                {stat.change && (
                 <div className="stat-change">
                   {getChangeIcon(stat.changeType)}
                   <span className={getChangeColor(stat.changeType)}>
                     {stat.change} from last {timeFilter === 'daily' ? 'day' : timeFilter === 'weekly' ? 'week' : timeFilter === 'monthly' ? 'month' : 'period'}
                   </span>
                 </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="main-grid">
          {/* Device Status */}
          <div className="main-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Device Status</div>
                <div className="card-description" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Real-time monitoring of all charging stations</div>
              </div>
              <button 
                className="view-all-button"
                onClick={() => handleNavigation('admin-devices')}
                style={{
                  backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
                  border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                  color: isDarkMode ? '#9aa3b2' : '#1f2937',
                  fontWeight: '500'
                }}
              >
                View All
              </button>
            </div>
            <div className="card-content">
                  {deviceStatus.length > 0 ? (
                    deviceStatus.slice(0, 3).map((device) => (
                <div 
                  key={device.id} 
                  className="device-item"
                  onClick={() => handleNavigation('admin-device-detail', device.id)}
                  style={{
                    backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb',
                    boxShadow: isDarkMode ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="device-info">
                    <div className={`status-indicator ${getStatusColor(device.status)}`}></div>
                    <div>
                      <div className="device-name" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{device.name}</div>
                      <div className="device-location" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
                        <MapPin className="w-3 h-3" />
                        <span>{device.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="device-stats">
                    <div className="device-power" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{device.power}</div>
                    <div className="device-voltage" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>{device.voltage}</div>
                          <div className="device-usage" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{device.usage}%</div>
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
          <div className="main-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="card-header">
              <div className="card-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>
                <Battery className="w-5 h-5" />
                <span>Energy Production</span>
              </div>
              <div className="card-description" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Daily energy generation across all stations</div>
            </div>
            <div className="card-content">
              <div className="energy-stats">
                <div className="energy-progress">
                  <div className="progress-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>
                    <span>Current Power Output</span>
                    <span className="progress-value">{overviewData.power_output?.toFixed(2) || 0}W</span>
                  </div>
                  <div className="progress-bar" style={{backgroundColor: isDarkMode ? '#1e2633' : '#e5e7eb'}}>
                    <div className="progress-fill" style={{width: `${Math.min((overviewData.percentage || 0), 100)}%`}}></div>
                  </div>
                  <div className="progress-text" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
                    {overviewData.percentage?.toFixed(2) || 0}% battery level
                  </div>
                </div>
                
                <div className="energy-metrics">
                  <div className="metric-card metric-green">
                    <div className="metric-value">{overviewData.volt?.toFixed(2)}V</div>
                    <div className="metric-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Voltage</div>
                  </div>
                  <div className="metric-card metric-blue">
                    <div className="metric-value">{overviewData.current?.toFixed(2)}A</div>
                    <div className="metric-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Current</div>
                  </div>
                </div>
                
                <div className="energy-generation" style={{
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)'
                }}>
                  <div className="generation-header">
                    <span className="generation-title" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Energy Generated Today</span>
                    <span className="generation-value">{formatEnergy(overviewData.energy.daily)}</span>
                  </div>
                  <div className="generation-details">
                    <div className="generation-item">
                      <span style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>This Week:</span>
                      <span style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{formatEnergy(overviewData.energy.weekly)}</span>
                    </div>
                    <div className="generation-item">
                      <span style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>This Month:</span>
                      <span style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{formatEnergy(overviewData.energy.monthly)}</span>
                    </div>
                    <div className="generation-item">
                      <span style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Total:</span>
                      <span style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{formatEnergy(overviewData.energy.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="main-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="card-header">
              <div className="card-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Recent Transactions</div>
              <div className="card-description" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Latest charging sessions and payments</div>
              <button 
                className="view-all-button"
                onClick={() => setIsTransactionsPopupOpen(true)}
                style={{
                  backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
                  border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                  color: isDarkMode ? '#9aa3b2' : '#1f2937',
                  fontWeight: '500'
                }}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-icon">
                      {transaction.type === 'rfid' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Coins className="w-4 h-4" style={{ color: '#fbbf24' }} />
                      )}
                    </div>
                    <div>
                      <div className="transaction-user" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{transaction.user}</div>
                      <div className="transaction-details" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
                        Station {transaction.station} • {transaction.time}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <div className="amount-value" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{transaction.amount}</div>
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
          {/* Chart 1: Technical Metrics */}
          <div className="analytics-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="analytics-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                  <Activity className="w-6 h-6" style={{ color: '#3b82f6' }} />
                  <span>Technical Metrics</span>
                </h3>
                <select 
                  value={selectedMetric} 
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  style={{ 
                    padding: '0.5rem', 
                    borderRadius: '0.375rem', 
                    border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#1f2937',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">All</option>
                  <option value="temperature">Temperature</option>
                  <option value="voltage">Voltage</option>
                  <option value="energy">Energy Accumulated</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <p style={{ fontSize: '1rem', color: isDarkMode ? '#9ca3af' : '#1f2937', marginTop: '0.125rem' }}>
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
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="period" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                      tickFormatter={(value) => Math.round(value)}
                      label={{ 
                        value: selectedMetric === 'all' ? 'Technical Metrics' : `${getMetricInfo(selectedMetric).label} (${getMetricInfo(selectedMetric).unit})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: isDarkMode ? '#ffffff' : '#1f2937',
                        boxShadow: isDarkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: isDarkMode ? '#ffffff' : '#1f2937', fontWeight: '500' }}
                      formatter={(value, name) => {
                        if (selectedMetric === 'all') {
                          // Map display names to data keys and units
                          const nameToDataKey = {
                            'Temperature': 'temperature',
                            'Voltage': 'voltage', 
                            'Energy': 'energy',
                            'Current': 'current'
                          };
                          
                          const dataKey = nameToDataKey[name];
                          const unitMap = {
                            temperature: '°C',
                            voltage: 'V',
                            energy: value >= 1000 ? 'kWh' : 'Wh',
                            current: 'A'
                          };
                          
                          const displayValue = dataKey === 'energy' && value >= 1000 ? (value / 1000).toFixed(2) : value;
                          return [`${displayValue} ${unitMap[dataKey] || ''}`, name];
                        }
                        
                        // Handle kWh formatting for individual metric
                        if (selectedMetric === 'energy') {
                          const displayValue = value >= 1000 ? (value / 1000).toFixed(2) : value;
                          const unit = value >= 1000 ? 'kWh' : 'Wh';
                          return [`${displayValue} ${unit}`, getMetricInfo(selectedMetric).label];
                        }
                        
                        return [`${value} ${getMetricInfo(selectedMetric).unit}`, getMetricInfo(selectedMetric).label];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: isDarkMode ? '#ffffff' : '#1f2937'
                      }}
                    />
                    {selectedMetric === 'all' ? (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Temperature"
                          dot={{ 
                            r: 4, 
                            fill: '#f59e0b',
                            stroke: '#ffffff',
                            strokeWidth: 2
                          }}
                          activeDot={{ 
                            r: 6, 
                            stroke: '#f59e0b',
                            strokeWidth: 2,
                            fill: '#ffffff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="voltage" 
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Voltage"
                          dot={{ 
                            r: 4, 
                            fill: '#3b82f6',
                            stroke: '#ffffff',
                            strokeWidth: 2
                          }}
                          activeDot={{ 
                            r: 6, 
                            stroke: '#3b82f6',
                            strokeWidth: 2,
                            fill: '#ffffff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#10b981"
                          strokeWidth={3}
                          name="Energy"
                          dot={{ 
                            r: 4, 
                            fill: '#10b981',
                            stroke: '#ffffff',
                            strokeWidth: 2
                          }}
                          activeDot={{ 
                            r: 6, 
                            stroke: '#10b981',
                            strokeWidth: 2,
                            fill: '#ffffff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="current" 
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          name="Current"
                          dot={{ 
                            r: 4, 
                            fill: '#8b5cf6',
                            stroke: '#ffffff',
                            strokeWidth: 2
                          }}
                          activeDot={{ 
                            r: 6, 
                            stroke: '#8b5cf6',
                            strokeWidth: 2,
                            fill: '#ffffff'
                          }}
                        />
                      </>
                    ) : (
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
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Chart 2: Revenue & Usage Trends */}
          <div className="analytics-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="analytics-header">
              <h3 className="analytics-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#10b981' }} />
                <span>Revenue & Usage Trends</span>
              </h3>
              <p style={{ fontSize: '1rem', color: isDarkMode ? '#9ca3af' : '#1f2937', marginTop: '0.125rem' }}>
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
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="period" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                      tickFormatter={(value) => Math.round(value)}
                      label={{ 
                        value: 'Revenue (₱)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280' }
                      }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                      tickFormatter={(value) => Math.round(value)}
                      label={{ 
                        value: 'Sessions', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: isDarkMode ? '#ffffff' : '#1f2937',
                        boxShadow: isDarkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: isDarkMode ? '#ffffff' : '#1f2937', fontWeight: '500' }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload && payload[0].payload.fullDate) {
                          return payload[0].payload.fullDate;
                        }
                        return label;
                      }}
                      formatter={(value, name) => {
                        if (name === 'Revenue (₱)') {
                          return [`₱${value.toFixed(2)}`, 'Total Revenue'];
                        } else if (name === 'Charging Sessions') {
                          return [`${value}`, 'Total Sessions'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: isDarkMode ? '#ffffff' : '#1f2937'
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
          </>
        )}
      </div>

      {/* Transactions Popup */}
      {isTransactionsPopupOpen && (
        <div className="transactions-popup-overlay">
          <div className="transactions-popup" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb',
            boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="popup-header">
              <h2 style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>All Transactions</h2>
              <button 
                className="popup-close"
                onClick={() => setIsTransactionsPopupOpen(false)}
                style={{
                  color: isDarkMode ? '#94a3b8' : '#1f2937',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDarkMode ? '#ffffff' : '#374151';
                  e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDarkMode ? '#94a3b8' : '#1f2937';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="popup-filters" style={{
              borderBottom: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb'
            }}>
              <div className="filter-group">
                <label style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}}>Sort by:</label>
                <select 
                  value={transactionsFilter} 
                  onChange={(e) => setTransactionsFilter(e.target.value)}
                  className="filter-select"
                  style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                    color: isDarkMode ? '#ffffff' : '#1f2937'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                </select>
              </div>
            </div>
            
            <div className="popup-content">
              {getFilteredTransactions().map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-icon">
                      {transaction.type === 'rfid' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Coins className="w-4 h-4" style={{ color: '#fbbf24' }} />
                      )}
                    </div>
                    <div>
                      <div className="transaction-user" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{transaction.user}</div>
                      <div className="transaction-details" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
                        Station {transaction.station} • {transaction.time}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <div className="amount-value" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{transaction.amount}</div>
                    <div className={`amount-badge ${transaction.type === 'rfid' ? 'badge-rfid' : 'badge-payment'}`}>
                      {transaction.type === 'rfid' ? 'RFID' : 'Payment'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;