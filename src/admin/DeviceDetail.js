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
  Coins,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminHeader from './AdminHeader';
import DeviceConfigurationModal from '../components/DeviceConfigurationModal';
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
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [sessionsFilter, setSessionsFilter] = useState('newest');
  const [deviceData, setDeviceData] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

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
      
      // Try dashboard endpoint first (has device info), then get alerts from devices endpoint
      let response;
      let data;
      
      try {
        console.log('Trying dashboard endpoint first for device info...');
        response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`Dashboard endpoint failed with status: ${response.status}`);
        }
        
        data = await response.json();
        console.log('Dashboard data:', data);
        
        // Find the specific device in the devices array
        const device = data.devices?.find(d => d.device_id === deviceId);
        if (device) {
          console.log('Found device in dashboard data:', device);
          
          // Create device data structure with device info from dashboard
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
            alerts: [] // Will be populated from devices endpoint
          };
          
          // Now try to get alerts from devices endpoint
          try {
            console.log('Fetching alerts from devices endpoint...');
            const alertsResponse = await authenticatedAdminFetch(`https://api-qcusolarcharge.up.railway.app/admin/devices?device_id=${deviceId}`);
            if (alertsResponse.ok) {
              const alertsData = await alertsResponse.json();
              console.log('Alerts data:', alertsData);
              deviceData.alerts = alertsData.alerts || [];
              console.log('Updated device data with alerts:', deviceData);
            }
          } catch (alertsError) {
            console.log('Failed to fetch alerts:', alertsError.message);
            // Keep alerts as empty array
          }
          
          setDeviceData(deviceData);
          return;
        } else {
          throw new Error('Device not found in dashboard data');
        }
        
      } catch (dashboardError) {
        console.log('Dashboard endpoint failed, trying devices endpoint...', dashboardError.message);
        
        // Fallback to devices endpoint
        try {
          response = await authenticatedAdminFetch(`https://api-qcusolarcharge.up.railway.app/admin/devices?device_id=${deviceId}`);
          
          if (!response.ok) {
            throw new Error(`Devices endpoint failed with status: ${response.status}`);
          }
          
          data = await response.json();
          console.log('Devices endpoint data:', data);
          
          // The devices endpoint has alerts but might not have device info
          if (data && data.device_id) {
            console.log('Setting device data from devices endpoint (may be missing device info)');
            setDeviceData(data);
            return;
          } else {
            throw new Error('Device data not found in devices endpoint response');
          }
        } catch (devicesError) {
          console.log('Both endpoints failed:', devicesError.message);
          throw new Error(`Both endpoints failed. Dashboard: ${dashboardError.message}, Devices: ${devicesError.message}`);
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

  // Get all metrics data for "all" option
  const getAllMetricsData = (timeFilter) => {
    if (!deviceData || !deviceData.energy_history || !Array.isArray(deviceData.energy_history)) {
      return [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }];
    }

    const allEnergyData = deviceData.energy_history.flat();
    const deviceEnergyData = allEnergyData.filter(entry => 
      entry && entry.device_id === deviceId
    );

    if (deviceEnergyData.length === 0) {
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
    const timeFilteredData = deviceEnergyData.filter(entry => {
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

  // Generate technical metrics data for charts from real API data
  const getTechnicalMetrics = (timeFilter, metricType) => {
    if (!deviceData) {
      return metricType === 'all' ? 
        [{ period: 'No Data', temperature: 0, voltage: 0, energy: 0, current: 0 }] :
        [{ period: 'No Data', value: 0 }];
    }

    // Handle "all" option - return data for all metrics
    if (metricType === 'all') {
      return getAllMetricsData(timeFilter);
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
      const allEnergyData = deviceData.energy_history.flat();
      
      // Map metric types to actual field names
      const fieldMapping = {
        'energy': 'energy_accumulated',
        'voltage': 'voltage', 
        'current': 'current',
        'temperature': 'temperature'
      };
      
      const actualFieldName = fieldMapping[metricType] || metricType;
      
      const deviceEnergyData = allEnergyData.filter(entry => 
        entry && entry.device_id === deviceId && entry[actualFieldName] !== undefined
      );

      console.log('Technical Metrics Debug:', {
        metricType,
        actualFieldName,
        timeFilter,
        allEnergyDataLength: allEnergyData.length,
        deviceEnergyDataLength: deviceEnergyData.length,
        sampleEntry: deviceEnergyData[0],
        rawEnergyHistory: deviceData.energy_history
      });

      if (deviceEnergyData.length > 0) {
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
        const filteredEnergyData = deviceEnergyData.filter(entry => {
          if (!entry.date_time) return false;
          let entryDate;
          if (entry.date_time.seconds) {
            entryDate = new Date(entry.date_time.seconds * 1000);
          } else {
            entryDate = new Date(entry.date_time);
          }
          return entryDate >= startDate;
        });

        if (filteredEnergyData.length === 0) {
          return [{ period: 'No Data', value: 0 }];
        }

        // Sort by date and group by time period
        const sortedData = filteredEnergyData.sort((a, b) => {
          const dateA = new Date(a.date_time?.seconds ? a.date_time.seconds * 1000 : a.date_time);
          const dateB = new Date(b.date_time?.seconds ? b.date_time.seconds * 1000 : b.date_time);
          return dateA - dateB;
        });

        // Group data by time period using the actual metric field
        const groupedData = groupDataByTimePeriod(sortedData, timeFilter, actualFieldName);
        return groupedData;
      }
    }

    // If no historical data available, use current API values
    const currentValue = deviceData[metricType] || 0;
    
    if (currentValue === 0) {
      return [{ period: 'No Data', value: 0 }];
    }

    // For current values, create a simple data point showing the current reading
    return [{ period: 'Current', value: currentValue }];
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
    return Object.entries(groups).map(([period, entries]) => {
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
        fullDate
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
        const filteredTransactions = deviceTransactions.filter(transaction => {
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
              
              const monthName = transactionDate.toLocaleDateString('en-US', { month: 'long' });
              const yearStr = transactionDate.getFullYear();
              fullDate = `${monthName} ${weekStart}-${weekEnd}, ${yearStr}`;
            }
          } else if (timeFilter === 'total') {
            // For total, show month and year
            const sampleTransaction = filteredTransactions.find(transaction => {
              const transactionDate = new Date(transaction.date_time?.seconds ? transaction.date_time.seconds * 1000 : transaction.date_time);
              const transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
              return transactionPeriod === period;
            });
            
            if (sampleTransaction) {
              const transactionDate = new Date(sampleTransaction.date_time?.seconds ? sampleTransaction.date_time.seconds * 1000 : sampleTransaction.date_time);
              const monthName = transactionDate.toLocaleDateString('en-US', { month: 'long' });
              const yearStr = transactionDate.getFullYear();
              fullDate = `${monthName} ${yearStr}`;
            }
          }
          
          return {
            period,
            fullDate,
            revenue: Math.round(data.revenue),
            sessions: data.sessions
          };
        });

        // Sort by period for better chart display
        return chartData.sort((a, b) => {
          if (timeFilter === 'daily') {
            return new Date(`2000-01-01 ${a.period}`) - new Date(`2000-01-01 ${b.period}`);
          } else if (timeFilter === 'weekly') {
            // Sort weekly dates by actual date
            const dateA = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
              return transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === a.period;
            });
            const dateB = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
              return transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === b.period;
            });
            
            if (dateA && dateB) {
              const transactionDateA = new Date(dateA.date_time?.seconds ? dateA.date_time.seconds * 1000 : dateA.date_time);
              const transactionDateB = new Date(dateB.date_time?.seconds ? dateB.date_time.seconds * 1000 : dateB.date_time);
              return transactionDateA - transactionDateB;
            }
          } else if (timeFilter === 'monthly') {
            // Sort monthly date ranges by actual date
            const dateA = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
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
              return transactionPeriod === a.period;
            });
            
            const dateB = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
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
              return transactionPeriod === b.period;
            });
            
            if (dateA && dateB) {
              const transactionDateA = new Date(dateA.date_time?.seconds ? dateA.date_time.seconds * 1000 : dateA.date_time);
              const transactionDateB = new Date(dateB.date_time?.seconds ? dateB.date_time.seconds * 1000 : dateB.date_time);
              return transactionDateA - transactionDateB;
            }
          } else if (timeFilter === 'total') {
            // Sort total months by actual date
            const dateA = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
              const transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
              return transactionPeriod === a.period;
            });
            
            const dateB = filteredTransactions.find(t => {
              const transactionDate = new Date(t.date_time?.seconds ? t.date_time.seconds * 1000 : t.date_time);
              const transactionPeriod = transactionDate.toLocaleDateString('en-US', { month: 'short' });
              return transactionPeriod === b.period;
            });
            
            if (dateA && dateB) {
              const transactionDateA = new Date(dateA.date_time?.seconds ? dateA.date_time.seconds * 1000 : dateA.date_time);
              const transactionDateB = new Date(dateB.date_time?.seconds ? dateB.date_time.seconds * 1000 : dateB.date_time);
              return transactionDateA - transactionDateB;
            }
          }
          return a.period.localeCompare(b.period);
        });
      }
    }

    // If no transaction data, return no data
    return [{ period: 'No Data', revenue: 0, sessions: 0 }];
  };

  const getMetricInfo = (metricType) => {
    const metricConfig = {
      all: { 
        label: 'All Metrics', 
        unit: '', 
        color: '#3b82f6', 
        icon: <Activity className="w-4 h-4" />,
        description: 'Display all technical metrics simultaneously'
      },
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
      console.log('No device data available, using fallback');
      return {
        id: deviceId || "QCU-001",
        name: `Device ${deviceId}`,
        location: "QCU Campus",
        building: "Main Building",
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

    console.log('=== PROCESSING DEVICE DATA ===');
    console.log('deviceData:', deviceData);
    console.log('deviceData.name:', deviceData.name);
    console.log('deviceData.location:', deviceData.location);
    console.log('deviceData.building:', deviceData.building);
    console.log('deviceId:', deviceId);

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
    
    const result = {
      id: deviceData.device_id || deviceId,
      name: deviceData.name || `Device ${deviceId}`,
      location: deviceData.location || "QCU Campus",
      building: deviceData.building || "Main Building",
      status: deviceData.status || "active",
      voltage: `${deviceData.volt || 0}V`,
      current: `${deviceData.current || 0}A`,
      temperature: `${deviceData.temperature || 0}°C`,
      batteryLevel: deviceData.percentage || 0,
      efficiency: Math.round(((deviceData.power || 0) / 300) * 100), // Mock efficiency calculation
      errorRate: 0.8, // Mock error rate
      ...timeFilteredData
    };
    
    console.log('=== FINAL DEVICE DATA RESULT ===');
    console.log('result:', result);
    console.log('result.name:', result.name);
    console.log('result.location:', result.location);
    console.log('result.building:', result.building);
    
    return result;
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
    console.log('=== GET ALERTS DEBUG ===');
    console.log('deviceData:', deviceData);
    console.log('deviceData.alerts:', deviceData?.alerts);
    console.log('deviceId:', deviceId);
    
    if (!deviceData?.alerts || !Array.isArray(deviceData.alerts)) {
      console.log('No alerts found or alerts is not an array');
      return [];
    }

    // Filter alerts by device_id
    const deviceAlerts = deviceData.alerts.filter(alert => alert.device_id === deviceId);
    console.log('Filtered device alerts:', deviceAlerts);

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
  console.log('Final alerts array:', alerts);
  console.log('Alerts length:', alerts.length);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDeviceData().finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleConfigureDevice = () => {
    // Get device info from the formatted data
    const formattedData = getFormattedDeviceData();
    if (formattedData) {
      setDeviceInfo(formattedData);
      setIsConfigModalOpen(true);
    }
  };

  const handleSaveConfiguration = (deviceId, configData) => {
    console.log('Saving configuration for device:', deviceId, configData);
    showSuccess(`Configuration saved for device ${deviceId}`);
    // TODO: Implement API call to save configuration
  };

  const handleEnableDisableDevice = (deviceId, isEnabled) => {
    console.log(`${isEnabled ? 'Enabling' : 'Disabling'} device:`, deviceId);
    showSuccess(`Device ${isEnabled ? 'enabled' : 'disabled'} successfully`);
    // TODO: Implement API call to enable/disable device
  };

  const handleDeleteDevice = (deviceId) => {
    console.log('Deleting device:', deviceId);
    showSuccess(`Device ${deviceId} deleted successfully`);
    // TODO: Implement API call to delete device
    // Navigate back to devices list after deletion
    navigate('/admin/devices');
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
          
          <button 
            className="configure-device-button"
            onClick={handleConfigureDevice}
          >
            <Settings className="button-icon" />
            Configure Device
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
                    {console.log('Rendering alerts, length:', alerts.length)}
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
                         <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'left' }}>
                           <div>Debug Info:</div>
                           <div>deviceData exists: {deviceData ? 'Yes' : 'No'}</div>
                           <div>deviceData.alerts: {JSON.stringify(deviceData?.alerts)}</div>
                           <div>deviceId: {deviceId}</div>
                           <div>alerts array length: {alerts.length}</div>
                         </div>
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
                       <div className="analytics-value energy">{formatEnergy((() => {
                         // Calculate energy from energy_history with time filtering
                         if (deviceData?.energy_history && Array.isArray(deviceData.energy_history)) {
                           const allEnergyData = deviceData.energy_history.flat();
                           const deviceEnergyData = allEnergyData.filter(entry => entry.device_id === deviceId);
                           
                           // Apply time filter
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
                           
                           // Filter by time period
                           const filteredEnergyData = deviceEnergyData.filter(entry => {
                             if (!entry.date_time) return false;
                             let entryDate;
                             if (entry.date_time.seconds) {
                               entryDate = new Date(entry.date_time.seconds * 1000);
                             } else {
                               entryDate = new Date(entry.date_time);
                             }
                             return entryDate >= startDate;
                           });
                           
                           return filteredEnergyData.reduce((sum, entry) => sum + (entry.energy_accumulated || 0), 0);
                         }
                         return 0;
                       })())}</div>
                      <div className="analytics-trend positive">
                        <span>↗</span>
                        <span>{(() => {
                          // Calculate improvement percentage based on actual energy data
                          const currentEnergy = (() => {
                            if (deviceData?.energy_history && Array.isArray(deviceData.energy_history)) {
                              const allEnergyData = deviceData.energy_history.flat();
                              const deviceEnergyData = allEnergyData.filter(entry => entry.device_id === deviceId);
                              
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
                                  startDate = new Date(0);
                                  break;
                                default:
                                  startDate = new Date(0);
                              }
                              
                              const filteredEnergyData = deviceEnergyData.filter(entry => {
                                if (!entry.date_time) return false;
                                let entryDate;
                                if (entry.date_time.seconds) {
                                  entryDate = new Date(entry.date_time.seconds * 1000);
                                } else {
                                  entryDate = new Date(entry.date_time);
                                }
                                return entryDate >= startDate;
                              });
                              
                              return filteredEnergyData.reduce((sum, entry) => sum + (entry.energy_accumulated || 0), 0);
                            }
                            return 0;
                          })();
                          
                          // Calculate previous period for comparison
                          const previousEnergy = (() => {
                            if (deviceData?.energy_history && Array.isArray(deviceData.energy_history)) {
                              const allEnergyData = deviceData.energy_history.flat();
                              const deviceEnergyData = allEnergyData.filter(entry => entry.device_id === deviceId);
                              
                              const now = new Date();
                              let startDate, endDate;
                              
                              switch (timeFilter) {
                                case 'daily':
                                  // Previous day (yesterday)
                                  endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                  startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                                  break;
                                case 'weekly':
                                  // Previous week (7-14 days ago)
                                  endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                  startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                                  break;
                                case 'monthly':
                                  // Previous month
                                  endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                  startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                                  break;
                                case 'total':
                                  return 0; // No previous period for total
                                default:
                                  return 0;
                              }
                              
                              const filteredEnergyData = deviceEnergyData.filter(entry => {
                                if (!entry.date_time) return false;
                                let entryDate;
                                if (entry.date_time.seconds) {
                                  entryDate = new Date(entry.date_time.seconds * 1000);
                                } else {
                                  entryDate = new Date(entry.date_time);
                                }
                                return entryDate >= startDate && entryDate < endDate;
                              });
                              
                              return filteredEnergyData.reduce((sum, entry) => sum + (entry.energy_accumulated || 0), 0);
                            }
                            return 0;
                          })();
                          
                          if (previousEnergy === 0) {
                            return currentEnergy > 0 ? '+100% vs prev period' : 'No data';
                          }
                          
                          const improvement = ((currentEnergy - previousEnergy) / previousEnergy) * 100;
                          const sign = improvement >= 0 ? '+' : '';
                          return `${sign}${improvement.toFixed(1)}% vs prev period`;
                        })()}</span>
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
                         
                         // Apply time filter
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
                         
                         // Filter transactions by time period
                         const filteredTransactions = deviceTransactions.filter(transaction => {
                           if (!transaction.date_time) return false;
                           let transactionDate;
                           if (transaction.date_time.seconds) {
                             transactionDate = new Date(transaction.date_time.seconds * 1000);
                           } else {
                             transactionDate = new Date(transaction.date_time);
                           }
                           return transactionDate >= startDate;
                         });
                         
                         return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                       })()}</div>
                      <div className={`analytics-trend ${(() => {
                        const currentRevenue = (() => {
                          const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                              startDate = new Date(0);
                              break;
                            default:
                              startDate = new Date(0);
                          }
                          
                          const filteredTransactions = deviceTransactions.filter(transaction => {
                            if (!transaction.date_time) return false;
                            let transactionDate;
                            if (transaction.date_time.seconds) {
                              transactionDate = new Date(transaction.date_time.seconds * 1000);
                            } else {
                              transactionDate = new Date(transaction.date_time);
                            }
                            return transactionDate >= startDate;
                          });
                          
                          return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                        })();
                        
                        const previousRevenue = (() => {
                          const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                          const now = new Date();
                          let startDate, endDate;
                          
                          switch (timeFilter) {
                            case 'daily':
                              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                              break;
                            case 'weekly':
                              endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                              startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                              break;
                            case 'monthly':
                              endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                              startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                              break;
                            case 'total':
                              return 0;
                            default:
                              return 0;
                          }
                          
                          const filteredTransactions = deviceTransactions.filter(transaction => {
                            if (!transaction.date_time) return false;
                            let transactionDate;
                            if (transaction.date_time.seconds) {
                              transactionDate = new Date(transaction.date_time.seconds * 1000);
        } else {
                              transactionDate = new Date(transaction.date_time);
                            }
                            return transactionDate >= startDate && transactionDate < endDate;
                          });
                          
                          return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                        })();
                        
                        if (previousRevenue === 0) {
                          return currentRevenue > 0 ? 'positive' : 'neutral';
                        }
                        
                        const improvement = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                        if (improvement > 0) return 'positive';
                        if (improvement < 0) return 'negative';
                        return 'neutral';
                      })()}`}>
                        <span>{(() => {
                          const currentRevenue = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                                startDate = new Date(0);
                                break;
                              default:
                                startDate = new Date(0);
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate;
                            });
                            
                            return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                          })();
                          
                          const previousRevenue = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                            const now = new Date();
                            let startDate, endDate;
                            
                            switch (timeFilter) {
                              case 'daily':
                                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                                break;
                              case 'weekly':
                                endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                              case 'monthly':
                                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                                break;
                              case 'total':
                                return 0;
                              default:
                                return 0;
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate && transactionDate < endDate;
                            });
                            
                            return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                          })();
                          
                          if (previousRevenue === 0) {
                            return currentRevenue > 0 ? '↗' : '→';
                          }
                          
                          const improvement = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                          if (improvement > 0) return '↗';
                          if (improvement < 0) return '↘';
                          return '→';
                        })()}</span>
                        <span>{(() => {
                          // Calculate revenue improvement
                          const currentRevenue = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                                startDate = new Date(0);
                                break;
                              default:
                                startDate = new Date(0);
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate;
                            });
                            
                            return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                          })();
                          
                          const previousRevenue = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                            const now = new Date();
                            let startDate, endDate;
                            
                            switch (timeFilter) {
                              case 'daily':
                                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                                break;
                              case 'weekly':
                                endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                              case 'monthly':
                                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                                break;
                              case 'total':
                                return 0;
                              default:
                                return 0;
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate && transactionDate < endDate;
                            });
                            
                            return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                          })();
                          
                          if (previousRevenue === 0) {
                            return currentRevenue > 0 ? '+100% vs prev period' : 'No data';
                          }
                          
                          const improvement = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                          
                          // Cap extreme percentages to prevent unrealistic values
                          const cappedImprovement = Math.max(-100, Math.min(100, improvement));
                          const sign = cappedImprovement >= 0 ? '+' : '';
                          return `${sign}${cappedImprovement.toFixed(1)}% vs prev period`;
                        })()}</span>
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
                         
                         // Apply time filter
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
                         
                         // Filter transactions by time period
                         const filteredTransactions = deviceTransactions.filter(transaction => {
                           if (!transaction.date_time) return false;
                           let transactionDate;
                           if (transaction.date_time.seconds) {
                             transactionDate = new Date(transaction.date_time.seconds * 1000);
      } else {
                             transactionDate = new Date(transaction.date_time);
                           }
                           return transactionDate >= startDate;
                         });
                         
                         return filteredTransactions.length;
                       })()}</div>
                      <div className={`analytics-trend ${(() => {
                        const currentUses = (() => {
                          const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                              startDate = new Date(0);
                              break;
                            default:
                              startDate = new Date(0);
                          }
                          
                          const filteredTransactions = deviceTransactions.filter(transaction => {
                            if (!transaction.date_time) return false;
                            let transactionDate;
                            if (transaction.date_time.seconds) {
                              transactionDate = new Date(transaction.date_time.seconds * 1000);
      } else {
                              transactionDate = new Date(transaction.date_time);
                            }
                            return transactionDate >= startDate;
                          });
                          
                          return filteredTransactions.length;
                        })();
                        
                        const previousUses = (() => {
                          const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                          const now = new Date();
                          let startDate, endDate;
                          
                          switch (timeFilter) {
                            case 'daily':
                              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
                            case 'weekly':
                              endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                              startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
                            case 'monthly':
                              endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                              startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
                            case 'total':
                              return 0;
      default:
                              return 0;
                          }
                          
                          const filteredTransactions = deviceTransactions.filter(transaction => {
                            if (!transaction.date_time) return false;
                            let transactionDate;
                            if (transaction.date_time.seconds) {
                              transactionDate = new Date(transaction.date_time.seconds * 1000);
                            } else {
                              transactionDate = new Date(transaction.date_time);
                            }
                            return transactionDate >= startDate && transactionDate < endDate;
                          });
                          
                          return filteredTransactions.length;
                        })();
                        
                        if (previousUses === 0) {
                          return currentUses > 0 ? 'positive' : 'neutral';
                        }
                        
                        const improvement = ((currentUses - previousUses) / previousUses) * 100;
                        if (improvement > 0) return 'positive';
                        if (improvement < 0) return 'negative';
                        return 'neutral';
                      })()}`}>
                        <span>{(() => {
                          const currentUses = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                                startDate = new Date(0);
        break;
      default:
                                startDate = new Date(0);
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate;
                            });
                            
                            return filteredTransactions.length;
                          })();
                          
                          const previousUses = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                            const now = new Date();
                            let startDate, endDate;
                            
                            switch (timeFilter) {
                              case 'daily':
                                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                                break;
                              case 'weekly':
                                endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                              case 'monthly':
                                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                                break;
                              case 'total':
                                return 0;
                              default:
                                return 0;
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate && transactionDate < endDate;
                            });
                            
                            return filteredTransactions.length;
                          })();
                          
                          if (previousUses === 0) {
                            return currentUses > 0 ? '↗' : '→';
                          }
                          
                          const improvement = ((currentUses - previousUses) / previousUses) * 100;
                          if (improvement > 0) return '↗';
                          if (improvement < 0) return '↘';
                          return '→';
                        })()}</span>
                        <span>{(() => {
                          // Calculate uses improvement
                          const currentUses = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
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
                                startDate = new Date(0);
                                break;
                              default:
                                startDate = new Date(0);
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate;
                            });
                            
                            return filteredTransactions.length;
                          })();
                          
                          const previousUses = (() => {
                            const deviceTransactions = deviceData?.transactions?.filter(t => t.device_id === deviceId) || [];
                            const now = new Date();
                            let startDate, endDate;
                            
                            switch (timeFilter) {
                              case 'daily':
                                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                                break;
                              case 'weekly':
                                endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                              case 'monthly':
                                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                                break;
                              case 'total':
                                return 0;
                              default:
                                return 0;
                            }
                            
                            const filteredTransactions = deviceTransactions.filter(transaction => {
                              if (!transaction.date_time) return false;
                              let transactionDate;
                              if (transaction.date_time.seconds) {
                                transactionDate = new Date(transaction.date_time.seconds * 1000);
                              } else {
                                transactionDate = new Date(transaction.date_time);
                              }
                              return transactionDate >= startDate && transactionDate < endDate;
                            });
                            
                            return filteredTransactions.length;
                          })();
                          
                          if (previousUses === 0) {
                            return currentUses > 0 ? '+100% vs prev period' : 'No data';
                          }
                          
                          const improvement = ((currentUses - previousUses) / previousUses) * 100;
                          
                          // Cap extreme percentages to prevent unrealistic values
                          const cappedImprovement = Math.max(-100, Math.min(100, improvement));
                          const sign = cappedImprovement >= 0 ? '+' : '';
                          return `${sign}${cappedImprovement.toFixed(1)}% vs prev period`;
                        })()}</span>
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
                        <option value="all">All</option>
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
                            domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                            tickFormatter={(value) => Math.round(value)}
                            label={{ 
                              value: selectedMetric === 'all' ? 'Technical Metrics' : `${getMetricInfo(selectedMetric).label} (${getMetricInfo(selectedMetric).unit})`, 
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
                            formatter={(value, name) => {
                              if (selectedMetric === 'all') {
                                const unitMap = {
                                  temperature: '°C',
                                  voltage: 'V',
                                  energy: 'Wh',
                                  current: 'A'
                                };
                                return [`${value} ${unitMap[name] || ''}`, name];
                              }
                              return [`${value} ${getMetricInfo(selectedMetric).unit}`, getMetricInfo(selectedMetric).label];
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              paddingTop: '20px',
                              color: '#ffffff'
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
                            domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                            tickFormatter={(value) => Math.round(value)}
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
                            domain={[0, (dataMax) => Math.ceil(dataMax * 1.1 / 10) * 10]}
                            tickFormatter={(value) => Math.round(value)}
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
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0] && payload[0].payload && payload[0].payload.fullDate) {
                                return payload[0].payload.fullDate;
                              }
                              return label;
                            }}
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

      {/* Device Configuration Modal */}
      <DeviceConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        device={deviceInfo || getFormattedDeviceData() ? {
          ...(deviceInfo || getFormattedDeviceData()),
          id: deviceId,
          isEnabled: (deviceInfo || getFormattedDeviceData())?.status?.toLowerCase() === 'active' || (deviceInfo || getFormattedDeviceData())?.status?.toLowerCase() === 'online'
        } : null}
        onSave={handleSaveConfiguration}
        onEnableDisable={handleEnableDisableDevice}
        onDelete={handleDeleteDevice}
      />
    </div>
  );
};

export default DeviceDetail;


