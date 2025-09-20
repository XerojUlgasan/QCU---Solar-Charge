import React from 'react';
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
  CreditCard
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

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
  const overviewStats = [
    {
      title: "Total Energy Generated",
      value: "2,847 kWh",
      change: "+12.5%",
      changeType: "positive",
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: "Revenue Generated",
      value: "₱18,420",
      change: "+8.3%", 
      changeType: "positive",
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      title: "Free RFID Hours Used",
      value: "1,247 hrs",
      change: "+15.2%",
      changeType: "positive",
      icon: <Clock className="w-4 h-4" />
    },
    {
      title: "Active Users Today",
      value: "156",
      change: "-2.1%",
      changeType: "negative",
      icon: <Users className="w-4 h-4" />
    }
  ];

  const deviceStatus = [
    {
      id: "QCU-001",
      name: "Main Library",
      location: "1st Floor, Main Entrance",
      status: "active",
      voltage: "24.2V",
      power: "3.2kW",
      usage: 85,
      revenue: "₱2,340",
      freeHours: 45
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
      freeHours: 32
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
      freeHours: 0
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
      freeHours: 28
    }
  ];

  const recentTransactions = [
    {
      id: "TXN-001",
      user: "student@qcu.edu.ph",
      station: "QCU-001",
      amount: "₱25.00",
      type: "payment",
      time: "2 min ago"
    },
    {
      id: "TXN-002",
      user: "john.doe@qcu.edu.ph",
      station: "QCU-002", 
      amount: "Free Hour",
      type: "rfid",
      time: "15 min ago"
    },
    {
      id: "TXN-003",
      user: "sarah.kim@qcu.edu.ph",
      station: "QCU-004",
      amount: "₱15.00",
      type: "payment",
      time: "1 hour ago"
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
              {deviceStatus.map((device) => (
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
                  </div>
                </div>
              ))}
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
                    <span>Today's Generation</span>
                    <span className="progress-value">156.2 kWh</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '78%'}}></div>
                  </div>
                  <div className="progress-text">
                    78% of daily target (200 kWh)
                  </div>
                </div>
                
                <div className="energy-metrics">
                  <div className="metric-card metric-green">
                    <div className="metric-value">2.8MW</div>
                    <div className="metric-label">Total Generated</div>
                  </div>
                  <div className="metric-card metric-blue">
                    <div className="metric-value">95%</div>
                    <div className="metric-label">Efficiency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="main-card">
            <div className="card-header">
              <div className="card-title">
                <Activity className="w-5 h-5" />
                <span>System Health</span>
              </div>
              <div className="card-description">Overall network performance metrics</div>
            </div>
            <div className="card-content">
              <div className="system-stats">
                <div className="system-progress">
                  <div className="progress-label">
                    <span>Network Uptime</span>
                    <span className="progress-value system-healthy">99.2%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '99.2%'}}></div>
                  </div>
                </div>
                
                <div className="system-metrics">
                  <div className="system-metric">
                    <span>Active Stations</span>
                    <span>3/4</span>
                  </div>
                  <div className="system-metric">
                    <span>Avg Response Time</span>
                    <span>1.2s</span>
                  </div>
                  <div className="system-metric">
                    <span>Error Rate</span>
                    <span className="system-healthy">0.8%</span>
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

export default AdminDashboard;
