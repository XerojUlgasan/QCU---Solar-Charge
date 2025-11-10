import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  MapPin, 
  Zap, 
  DollarSign, 
  Clock, 
  Battery, 
  Activity,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Import
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import DeviceConfigurationModal from '../components/DeviceConfigurationModal';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/AdminDevices.css';
import { API_BASE_URL } from '../utils/api';

const AdminDevices = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { authenticatedAdminFetch } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const { onCollectionChange, isConnected } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    location: '',
    building: ''
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringDevice, setConfiguringDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('testing');

  // Format energy values - only show 'k' when over 1000
  const formatEnergy = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}kWh`;
    }
    return `${value.toFixed(1)}Wh`;
  };

  // Fetch devices data from API
  const fetchDevicesData = useCallback(async () => {
    try {
      console.log('Fetching devices data from /admin/dashboard...');
      
      const response = await authenticatedAdminFetch(API_BASE_URL + '/admin/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Devices API response data:', data);
      
      // Handle the API response format
      if (data.revenue || data.uses || data.energy_generated || data.devices) {
        console.log('✅ Using direct API data format for devices');
        
        // Calculate individual device revenue from transactions
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

        // Debug device structure
        console.log('📱 Device Structure Analysis:');
        console.log('📊 Available devices:', data.devices);
        console.log('📊 First device sample:', data.devices?.[0]);
        console.log('📊 Device keys:', data.devices?.[0] ? Object.keys(data.devices[0]) : 'No devices');
        console.log('📊 ALL DEVICE IDs FROM API:', data.devices?.map(d => d.id || d.device_id || d.deviceId || d._id));
        
        // Map API devices to our expected format
        const mappedDevices = (data.devices || []).map(device => {
          // Debug device ID - check multiple possible field names
          console.log('🔍 Processing device:', device);
          console.log('🔍 Device ID field (device.id):', device.id);
          console.log('🔍 Device ID field (device.device_id):', device.device_id);
          console.log('🔍 Device ID field (device.deviceId):', device.deviceId);
          console.log('🔍 Device ID field (device._id):', device._id);
          console.log('🔍 All device fields:', Object.keys(device));
          
          // Try to find the actual device ID field
          const actualDeviceId = device.id || device.device_id || device.deviceId || device._id;
          console.log('🔍 Using device ID:', actualDeviceId);
          
          // Resolve date added for sorting (fallback to last_updated)
          const dateAdded = device.date_added || device.created_at || device.added_at || device.timestamp || device.last_updated;
          const dateAddedSeconds = dateAdded?.seconds 
            ? dateAdded.seconds 
            : (dateAdded ? Math.floor(new Date(dateAdded).getTime() / 1000) : 0);
          
          // Calculate individual device revenue from actual transactions
          const deviceRevenue = calculateDeviceRevenue(actualDeviceId, data.transactions);
          
          return {
            id: actualDeviceId || `Device-${Math.random()}`,
            name: device.name || 'Unknown Device',
            location: device.location || 'Unknown Location',
            building: device.building || 'Unknown Building',
            status: device.status || 'unknown',
            voltage: `${device.volt || 0}V`,
            current: `${device.current || 0}A`,
            power: formatPower(device.power || 0),
            energy: formatEnergy(device.energy || 0),
            usage: device.percentage || 0,
            revenue: `₱${deviceRevenue.toFixed(0)}`, // Use actual transaction revenue
            temperature: `${device.temperature || 0}°C`,
            batteryLevel: device.percentage || 0,
            lastUpdate: formatLastUpdated(device.last_updated),
            // Keep raw date for sorting
            _dateAddedSeconds: dateAddedSeconds,
            // Add API revenue data for total calculation
            apiRevenue: data.revenue ? data.revenue.total || 0 : 0
          };
        });
        
        // Sort newest to oldest by date_added (fallback handled above)
        mappedDevices.sort((a, b) => (b._dateAddedSeconds || 0) - (a._dateAddedSeconds || 0));
        
        // Calculate total power from mapped devices
        const calculatedTotalPower = mappedDevices.reduce((sum, d) => {
          const powerStr = d.power || '0W';
          let powerValue;
          
          if (powerStr.includes('kW')) {
            // Convert kW to W
            powerValue = parseFloat(powerStr.replace('kW', '')) * 1000;
          } else {
            // Already in W
            powerValue = parseFloat(powerStr.replace('W', ''));
          }
          
          return sum + powerValue;
        }, 0);
        
        setDevices(mappedDevices);
        setConnectionStatus('connected');
        console.log('✅ Devices data mapped and set successfully:', mappedDevices);
        console.log('💰 API Revenue Data:', data.revenue);
        console.log('⚡ Total Power Calculation:', calculatedTotalPower, 'W');
        console.log('📊 Formatted Total Power:', formatTotalPower(calculatedTotalPower));
        
        // Debug individual device revenue calculations
        console.log('💵 Individual Device Revenue Calculations (from transactions):');
        console.log('📊 Available Transactions:', data.transactions);
        console.log('📊 Transaction Structure Sample:', data.transactions?.[0]);
        console.log('📊 Transaction device_id fields:', (data.transactions || []).map(t => t.device_id));
        mappedDevices.forEach(device => {
          const deviceTransactions = (data.transactions || []).filter(transaction => 
            transaction.device_id === device.id
          );
          console.log(`  ${device.id} (${device.name}): ${device.revenue} (${deviceTransactions.length} transactions)`);
          if (deviceTransactions.length > 0) {
            console.log(`    Transactions:`, deviceTransactions.map(t => `₱${t.amount}`).join(', '));
            console.log(`    Transaction Details:`, deviceTransactions);
          } else {
            console.log(`    No transactions found for device ${device.id}`);
            console.log(`    Available device_id values in transactions:`, (data.transactions || []).map(t => t.device_id).filter(Boolean));
            console.log(`    Device ID being searched: "${device.id}"`);
          }
        });
      } else {
        setConnectionStatus('invalid_format');
        console.log('❌ Could not extract devices data, using fallback');
        setDevices([]);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Error fetching devices data:', error);
      console.log('Using fallback data due to error');
      setDevices([]);
      setError(`Failed to load devices data: ${error.message}`);
    }
  }, [authenticatedAdminFetch]);

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

  // Listen to socket changes and update devices array directly
  useEffect(() => {
    if (!isConnected) return;

    // Listen to device changes
    const cleanupDevices = onCollectionChange('devices', (data) => {
      console.log('📡 Device change detected in AdminDevices:', data);
      
      setDevices(prevDevices => {
        const { type, id, data: deviceData } = data;
        const deviceId = id || deviceData?.id || deviceData?.device_id;
        
        if (type === 'added') {
          // Add new device - need to calculate revenue first
          const deviceExists = prevDevices.some(dev => dev.id === deviceId);
          if (!deviceExists) {
            console.log('➕ Adding new device:', deviceId);
            // For new devices, we'll need to refetch to get proper formatting
            // But for now, add a basic device entry
            fetchDevicesData();
            return prevDevices;
          }
        } else if (type === 'modified') {
          // Update existing device
          console.log('🔄 Updating device:', deviceId);
          // For device updates, refetch to ensure revenue calculations are correct
          fetchDevicesData();
          return prevDevices;
        } else if (type === 'removed') {
          // Remove device from array
          console.log('➖ Removing device:', deviceId);
          return prevDevices.filter(dev => dev.id !== deviceId);
        }
        
        return prevDevices;
      });
    });

    // Listen to transaction changes (for revenue updates)
    const cleanupTransactions = onCollectionChange('transactions', (data) => {
      console.log('📡 Transaction change detected in AdminDevices, updating revenue...', data);
      // Transactions affect revenue calculations, so refetch devices
      fetchDevicesData();
    });

    return () => {
      cleanupDevices();
      cleanupTransactions();
    };
  }, [isConnected, onCollectionChange, fetchDevicesData]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchDevicesData();
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchDevicesData]);

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

  const getBatteryColor = (level) => {
    if (level > 50) return 'battery-high';
    if (level > 20) return 'battery-medium';
    return 'battery-low';
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || device.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setDeviceForm({
      name: device.name,
      location: device.location,
      building: device.building
    });
    setIsEditDialogOpen(true);
  };

  const handleConfigureDevice = (device) => {
    setConfiguringDevice({
      ...device,
      isEnabled: device.status?.toLowerCase() === 'active' || device.status?.toLowerCase() === 'online'
    });
    setIsConfigModalOpen(true);
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
    // Refresh devices list after deletion
    fetchDevicesData();
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();
    if (!deviceForm.name || !deviceForm.location || !deviceForm.building) {
      showError('Please fill in all fields');
      return;
    }
    
    try {
      console.log('=== UPDATING DEVICE ===');
      console.log('Device ID:', editingDevice.id);
      console.log('Form Data:', deviceForm);
      
      // Prepare the request body according to the API specification
      const updateData = {
        device_id: editingDevice.id,
        device_name: deviceForm.name,
        device_location: deviceForm.location,
        device_building: deviceForm.building
      };
      
      console.log('Update payload:', updateData);
      
      // Call the update device API
      const response = await authenticatedAdminFetch(API_BASE_URL +'/admin/updateDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Update response:', responseData);
        
        showSuccess(`Device "${deviceForm.name}" updated successfully!`);
        
        // Refresh the devices data to reflect changes
        await fetchDevicesData();
        
        // Reset form and close dialog
        setDeviceForm({ name: '', location: '', building: '' });
        setEditingDevice(null);
        setIsEditDialogOpen(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating device:', error);
      showError(`Failed to update device: ${error.message}`);
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

  const totalActive = devices.filter(d => {
    const status = d.status?.toLowerCase();
    // Consider active if status is 'active' or any variation that indicates the device is working
    return status === 'active' || 
           status === 'online' || 
           status === 'running' || 
           status === 'operational' ||
           status === 'connected' ||
           (status && !['offline', 'inactive', 'maintenance', 'error', 'failed', 'disconnected'].includes(status));
  }).length;
  
  // Calculate total power from API data (convert to kW if needed)
  const totalPower = devices.reduce((sum, d) => {
    const powerStr = d.power || '0W';
    let powerValue;
    
    if (powerStr.includes('kW')) {
      // Convert kW to W
      powerValue = parseFloat(powerStr.replace('kW', '')) * 1000;
    } else {
      // Already in W
      powerValue = parseFloat(powerStr.replace('W', ''));
    }
    
    return sum + powerValue;
  }, 0);
  
  // Format total power - show as kW if >= 1000W, otherwise as W
  const formatTotalPower = (totalWatts) => {
    if (totalWatts >= 1000) {
      return `${(totalWatts / 1000).toFixed(1)}kW`;
    }
    return `${totalWatts.toFixed(1)}W`;
  };
  
  // Use API revenue data if available, otherwise calculate from devices
  const totalRevenue = devices.length > 0 && devices[0].apiRevenue 
    ? devices[0].apiRevenue 
    : devices.reduce((sum, d) => sum + parseFloat(d.revenue.replace('₱', '').replace(',', '') || '0'), 0);

  return (
    <div id="admin-devices" style={{
      backgroundColor: isDarkMode ? undefined : '#f8fafc',
      minHeight: '100vh'
    }}>
      <AdminHeader 
        title="Device Management" 
        navigate={handleNavigation}
      />
      
      <div className="devices-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading devices data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => {
              setLoading(true);
              setError(null);
              fetchDevicesData();
            }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="devices-header">
              <h2 className="devices-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Device Management</h2>
            </div>

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{
            backgroundColor: isDarkMode ? undefined : '#f9fafb',
            border: isDarkMode ? undefined : '2px solid #d1d5db',
            boxShadow: isDarkMode ? undefined : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="stat-header">
              <div className="stat-title" style={{color: isDarkMode ? undefined : '#1f2937'}}>Active Devices</div>
              <Activity className="w-6 h-6 stat-icon" style={{color: isDarkMode ? undefined : '#2563eb'}} />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>{totalActive}/{devices.length}</div>
              <div className="stat-description" style={{color: isDarkMode ? undefined : '#6b7280'}}>
                {Math.round((totalActive / devices.length) * 100)}% operational
              </div>
            </div>
          </div>

          <div className="stat-card" style={{
            backgroundColor: isDarkMode ? undefined : '#f9fafb',
            border: isDarkMode ? undefined : '2px solid #d1d5db',
            boxShadow: isDarkMode ? undefined : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="stat-header">
              <div className="stat-title" style={{color: isDarkMode ? undefined : '#1f2937'}}>Total Power Output</div>
              <Zap className="w-6 h-6 stat-icon" style={{color: isDarkMode ? undefined : '#f59e0b'}} />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>{formatTotalPower(totalPower)}</div>
              <div className="stat-description" style={{color: isDarkMode ? undefined : '#6b7280'}}>
                Current generation capacity
              </div>
            </div>
          </div>

          <div className="stat-card" style={{
            backgroundColor: isDarkMode ? undefined : '#f9fafb',
            border: isDarkMode ? undefined : '2px solid #d1d5db',
            boxShadow: isDarkMode ? undefined : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="stat-header">
              <div className="stat-title" style={{color: isDarkMode ? undefined : '#1f2937'}}>Total Revenue</div>
              <DollarSign className="w-6 h-6 stat-icon" style={{color: isDarkMode ? undefined : '#16a34a'}} />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>₱{totalRevenue.toLocaleString()}</div>
              <div className="stat-description" style={{color: isDarkMode ? undefined : '#6b7280'}}>
                Monthly earnings
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-filter-group">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
              style={{
                backgroundColor: isDarkMode ? undefined : '#ffffff',
                border: isDarkMode ? undefined : '2px solid #d1d5db',
                color: isDarkMode ? undefined : '#1f2937'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <button 
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                await fetchDevicesData();
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
              backgroundColor: isDarkMode ? undefined : '#ffffff',
              border: isDarkMode ? undefined : '2px solid #d1d5db',
              color: isDarkMode ? undefined : '#1f2937'
            }}
          >
            <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Edit Device Dialog */}
        {isEditDialogOpen && (
          <div className="dialog-overlay" style={{
            backgroundColor: isDarkMode ? undefined : 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="dialog-content" style={{
              backgroundColor: isDarkMode ? undefined : '#ffffff',
              border: isDarkMode ? undefined : '2px solid #d1d5db',
              boxShadow: isDarkMode ? undefined : '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="dialog-header">
                <h3 className="dialog-title" style={{color: isDarkMode ? undefined : '#1f2937'}}>Edit Device</h3>
                <p className="dialog-description" style={{color: isDarkMode ? undefined : '#1f2937'}}>
                  Update the details for {editingDevice?.name}.
                </p>
              </div>
              <form onSubmit={handleSaveDevice} className="dialog-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label" style={{color: isDarkMode ? undefined : '#1f2937'}}>Device Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Main Library"
                    value={deviceForm.name}
                    onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                    required
                    className="form-input"
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '2px solid #d1d5db',
                      color: isDarkMode ? undefined : '#1f2937'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location" className="form-label" style={{color: isDarkMode ? undefined : '#1f2937'}}>Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g., 1st Floor, Main Entrance"
                    value={deviceForm.location}
                    onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                    required
                    className="form-input"
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '2px solid #d1d5db',
                      color: isDarkMode ? undefined : '#1f2937'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="building" className="form-label" style={{color: isDarkMode ? undefined : '#1f2937'}}>Building</label>
                  <input
                    id="building"
                    type="text"
                    placeholder="e.g., Library Building"
                    value={deviceForm.building}
                    onChange={(e) => setDeviceForm({ ...deviceForm, building: e.target.value })}
                    required
                    className="form-input"
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '2px solid #d1d5db',
                      color: isDarkMode ? undefined : '#1f2937'
                    }}
                  />
                </div>
                <div className="dialog-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setIsEditDialogOpen(false)}
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '2px solid #d1d5db',
                      color: isDarkMode ? undefined : '#1f2937'
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button" style={{
                    backgroundColor: isDarkMode ? undefined : '#2563eb',
                    border: isDarkMode ? undefined : '2px solid #1d4ed8',
                    color: '#ffffff'
                  }}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Device Configuration Modal */}
        <DeviceConfigurationModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          device={configuringDevice}
          onSave={handleSaveConfiguration}
          onEnableDisable={handleEnableDisableDevice}
          onDelete={handleDeleteDevice}
        />

        {/* Device Grid */}
        <div className="devices-grid">
          {filteredDevices.map((device, index) => (
            <div 
              key={device.id} 
              className="device-card fade-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                backgroundColor: isDarkMode ? undefined : '#ffffff',
                border: isDarkMode ? undefined : '2px solid #d1d5db',
                boxShadow: isDarkMode ? undefined : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              onClick={() => handleNavigation('admin-device-detail', device.id)}
            >
              <div className="device-header">
                <div className="device-info">
                  <div className="device-name" style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.name}</div>
                  <div className="device-location">
                    <MapPin className="location-icon" />
                    <span style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.location} • {device.building}</span>
                  </div>
                </div>
                <div className="device-status-group">
                  <div className={`status-badge ${getStatusColor(device.status)}`}>
                    {device.status}
                  </div>
                  <div className="device-id" style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.id}</div>
                </div>
              </div>
              
              <div className="device-content">
                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value metric-blue">{device.power}</div>
                    <div className="metric-label" style={{color: isDarkMode ? undefined : '#1f2937'}}>Power</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value metric-green">{device.revenue}</div>
                    <div className="metric-label" style={{color: isDarkMode ? undefined : '#1f2937'}}>Revenue</div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="technical-details">
                  <div className="detail-row">
                    <span style={{color: isDarkMode ? undefined : '#1f2937'}}>Voltage:</span>
                    <span className="detail-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.voltage}</span>
                  </div>
                  <div className="detail-row">
                    <span style={{color: isDarkMode ? undefined : '#1f2937'}}>Current:</span>
                    <span className="detail-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.current}</span>
                  </div>
                  <div className="detail-row">
                    <span style={{color: isDarkMode ? undefined : '#1f2937'}}>Temperature:</span>
                    <span className="detail-value" style={{color: isDarkMode ? undefined : '#1f2937'}}>{device.temperature}</span>
                  </div>
                </div>

                {/* Battery Level */}
                <div className="battery-section">
                  <div className="battery-header">
                    <span style={{color: isDarkMode ? undefined : '#1f2937'}}>Battery Level:</span>
                    <span className={`battery-value ${getBatteryColor(device.batteryLevel)}`}>
                      {device.batteryLevel}%
                    </span>
                  </div>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill" 
                      style={{width: `${device.batteryLevel}%`}}
                    ></div>
                  </div>
                </div>


                {/* Edit Button */}
                <div className="edit-section">
                  <button 
                    className="edit-device-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDevice(device);
                    }}
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#ffffff',
                      border: isDarkMode ? undefined : '2px solid #d1d5db',
                      color: isDarkMode ? undefined : '#1f2937',
                      boxShadow: isDarkMode ? undefined : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <Edit className="button-icon" />
                    Edit Device
                  </button>
                  
                  <button 
                    className="configure-device-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfigureDevice(device);
                    }}
                    style={{
                      backgroundColor: isDarkMode ? undefined : '#2563eb',
                      border: isDarkMode ? undefined : '2px solid #1d4ed8',
                      color: '#ffffff'
                    }}
                  >
                    <Settings className="button-icon" />
                    Configure Device
                  </button>
                </div>

                <div className="last-updated" style={{color: isDarkMode ? undefined : '#1f2937'}}>
                  Last updated: {device.lastUpdate}
                </div>
                <div className="date-added" style={{color: isDarkMode ? undefined : '#1f2937', fontSize: '12px', marginTop: '2px'}}>
                  {(() => {
                    try {
                      const ts = device?._dateAddedSeconds ? { seconds: device._dateAddedSeconds } : null;
                      const d = ts?.seconds ? new Date(ts.seconds * 1000) : null;
                      return `Date added: ${d && !isNaN(d.getTime()) ? d.toLocaleString() : 'Unknown'}`;
                    } catch {
                      return 'Date added: Unknown';
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="no-devices">
            <p>No devices found matching your criteria.</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDevices;
