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
  Filter
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import '../styles/AdminDevices.css';

const AdminDevices = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { authenticatedAdminFetch } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    location: '',
    building: ''
  });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('testing');

  // Fetch devices data from API
  const fetchDevicesData = useCallback(async () => {
    try {
      console.log('Fetching devices data from /admin/dashboard...');
      
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Devices API response data:', data);
      
      // Handle the API response format
      if (data.revenue || data.uses || data.energy_generated || data.devices) {
        console.log('✅ Using direct API data format for devices');
        
        // Map API devices to our expected format
        const mappedDevices = (data.devices || []).map(device => ({
          id: device.id || `Device-${Math.random()}`,
          name: device.name || 'Unknown Device',
          location: device.location || 'Unknown Location',
          building: device.building || 'Unknown Building',
          status: device.status || 'unknown',
          voltage: `${device.volt || 0}V`,
          current: `${device.current || 0}A`,
          power: formatPower(device.power || 0),
          energy: `${(device.energy || 0).toFixed(1)}kWh`,
          usage: device.percentage || 0,
          revenue: '₱0', // Not provided in API yet
          freeHours: 0, // Not provided in API yet
          temperature: `${device.temperature || 0}°C`,
          batteryLevel: device.percentage || 0,
          lastUpdate: formatLastUpdated(device.last_updated),
          // Add API revenue data for total calculation
          apiRevenue: data.revenue ? data.revenue.total || 0 : 0
        }));
        
        // Calculate total power from mapped devices
        const calculatedTotalPower = mappedDevices.reduce((sum, d) => {
          const powerStr = d.power || '0W';
          const powerValue = parseFloat(powerStr.replace(/[kW]/g, ''));
          return sum + powerValue;
        }, 0);
        
        setDevices(mappedDevices);
        setConnectionStatus('connected');
        console.log('✅ Devices data mapped and set successfully:', mappedDevices);
        console.log('💰 API Revenue Data:', data.revenue);
        console.log('⚡ Total Power Calculation:', calculatedTotalPower, 'W');
        console.log('📊 Formatted Total Power:', formatTotalPower(calculatedTotalPower));
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
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
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
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
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

  const handleSaveDevice = (e) => {
    e.preventDefault();
    if (!deviceForm.name || !deviceForm.location || !deviceForm.building) {
      showError('Please fill in all fields');
      return;
    }
    
    // Mock device update
    showSuccess(`Device "${deviceForm.name}" updated successfully!`);
    setDeviceForm({ name: '', location: '', building: '' });
    setEditingDevice(null);
    setIsEditDialogOpen(false);
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

  const totalActive = devices.filter(d => d.status === 'active').length;
  
  // Calculate total power from API data (convert to kW if needed)
  const totalPower = devices.reduce((sum, d) => {
    const powerStr = d.power || '0W';
    const powerValue = parseFloat(powerStr.replace(/[kW]/g, ''));
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
    <div id="admin-devices">
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
        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Active Devices</div>
              <Activity className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalActive}/{devices.length}</div>
              <div className="stat-description">
                {Math.round((totalActive / devices.length) * 100)}% operational
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Total Power Output</div>
              <Zap className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatTotalPower(totalPower)}</div>
              <div className="stat-description">
                Current generation capacity
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Total Revenue</div>
              <DollarSign className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">₱{totalRevenue.toLocaleString()}</div>
              <div className="stat-description">
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
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Edit Device Dialog */}
        {isEditDialogOpen && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <div className="dialog-header">
                <h3 className="dialog-title">Edit Device</h3>
                <p className="dialog-description">
                  Update the details for {editingDevice?.name}.
                </p>
              </div>
              <form onSubmit={handleSaveDevice} className="dialog-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Device Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Main Library"
                    value={deviceForm.name}
                    onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g., 1st Floor, Main Entrance"
                    value={deviceForm.location}
                    onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="building" className="form-label">Building</label>
                  <input
                    id="building"
                    type="text"
                    placeholder="e.g., Library Building"
                    value={deviceForm.building}
                    onChange={(e) => setDeviceForm({ ...deviceForm, building: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="dialog-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Device Grid */}
        <div className="devices-grid">
          {filteredDevices.map((device) => (
            <div 
              key={device.id} 
              className="device-card"
              onClick={() => handleNavigation('admin-device-detail', device.id)}
            >
              <div className="device-header">
                <div className="device-info">
                  <div className="device-name">{device.name}</div>
                  <div className="device-location">
                    <MapPin className="location-icon" />
                    <span>{device.location}</span>
                  </div>
                </div>
                <div className="device-status-group">
                  <div className={`status-badge ${getStatusColor(device.status)}`}>
                    {device.status}
                  </div>
                  <div className="device-id">{device.id}</div>
                </div>
              </div>
              
              <div className="device-content">
                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value metric-blue">{device.power}</div>
                    <div className="metric-label">Power</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value metric-green">{device.revenue}</div>
                    <div className="metric-label">Revenue</div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="technical-details">
                  <div className="detail-row">
                    <span>Voltage:</span>
                    <span className="detail-value">{device.voltage}</span>
                  </div>
                  <div className="detail-row">
                    <span>Current:</span>
                    <span className="detail-value">{device.current}</span>
                  </div>
                  <div className="detail-row">
                    <span>Temperature:</span>
                    <span className="detail-value">{device.temperature}</span>
                  </div>
                </div>

                {/* Battery Level */}
                <div className="battery-section">
                  <div className="battery-header">
                    <span>Battery Level:</span>
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

                {/* Usage Stats */}
                <div className="usage-stats">
                  <div className="usage-item">
                    <Clock className="usage-icon" />
                    <span>{device.freeHours}h free</span>
                  </div>
                  <div className="usage-item">
                    <Battery className="usage-icon" />
                    <span>{device.usage}% usage</span>
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
                  >
                    <Edit className="button-icon" />
                    Edit Device
                  </button>
                </div>

                <div className="last-updated">
                  Last updated: {device.lastUpdate}
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
