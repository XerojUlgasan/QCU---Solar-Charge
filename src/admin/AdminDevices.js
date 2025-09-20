import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
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
import '../styles/AdminDevices.css';

const AdminDevices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    location: '',
    building: ''
  });

  const devices = [
    {
      id: "QCU-001",
      name: "Main Library",
      location: "1st Floor, Main Entrance",
      building: "Library Building",
      status: "active",
      voltage: "24.2V",
      current: "13.3A",
      power: "3.2kW",
      energy: "156.8kWh",
      usage: 85,
      revenue: "₱2,340",
      freeHours: 45,
      temperature: "28°C",
      batteryLevel: 92,
      lastUpdate: "2 min ago"
    },
    {
      id: "QCU-002", 
      name: "Student Center",
      location: "Food Court Area",
      building: "Student Center",
      status: "active",
      voltage: "23.8V",
      current: "12.2A",
      power: "2.9kW",
      energy: "134.2kWh",
      usage: 72,
      revenue: "₱1,890",
      freeHours: 32,
      temperature: "26°C",
      batteryLevel: 88,
      lastUpdate: "1 min ago"
    },
    {
      id: "QCU-003",
      name: "Engineering Building",
      location: "Lobby",
      building: "Engineering Building",
      status: "maintenance",
      voltage: "0V",
      current: "0A",
      power: "0kW",
      energy: "0kWh",
      usage: 0,
      revenue: "₱0",
      freeHours: 0,
      temperature: "N/A",
      batteryLevel: 0,
      lastUpdate: "2 hours ago"
    },
    {
      id: "QCU-004",
      name: "Sports Complex",
      location: "Main Entrance",
      building: "Sports Complex",
      status: "active",
      voltage: "24.5V",
      current: "7.3A",
      power: "1.8kW",
      energy: "89.5kWh",
      usage: 45,
      revenue: "₱1,120",
      freeHours: 28,
      temperature: "30°C",
      batteryLevel: 76,
      lastUpdate: "3 min ago"
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

  const handleAddDevice = (e) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.location || !newDevice.building) {
      alert('Please fill in all fields');
      return;
    }
    
    // Mock device addition
    alert(`Device "${newDevice.name}" added successfully!`);
    setNewDevice({ name: '', location: '', building: '' });
    setIsAddDialogOpen(false);
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
  const totalPower = devices.reduce((sum, d) => sum + parseFloat(d.power.replace('kW', '') || '0'), 0);
  const totalRevenue = devices.reduce((sum, d) => sum + parseFloat(d.revenue.replace('₱', '').replace(',', '') || '0'), 0);

  return (
    <div id="admin-devices">
      <AdminHeader 
        title="Device Management" 
        navigate={handleNavigation}
      />
      
      <div className="devices-content">
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
              <div className="stat-value">{totalPower.toFixed(1)}kW</div>
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

          <button 
            className="add-device-button"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="button-icon" />
            Add Device
          </button>
        </div>

        {/* Add Device Dialog */}
        {isAddDialogOpen && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <div className="dialog-header">
                <h3 className="dialog-title">Add New Device</h3>
                <p className="dialog-description">
                  Register a new EcoCharge station in the network.
                </p>
              </div>
              <form onSubmit={handleAddDevice} className="dialog-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Device Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Main Library"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
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
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
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
                    value={newDevice.building}
                    onChange={(e) => setNewDevice({ ...newDevice, building: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="dialog-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Add Device
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
      </div>
    </div>
  );
};

export default AdminDevices;
