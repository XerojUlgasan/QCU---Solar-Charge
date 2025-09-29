import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Key, 
  Bell, 
  Shield, 
  User, 
  Globe, 
  Database,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  AlertCircle
} from 'lucide-react';
import '../styles/AdminSettingsModal.css';

const AdminSettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Globe className="w-4 h-4" /> }
  ];

  if (!isOpen) return null;

  const renderAccountSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Profile Information</h3>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter your full name"
            defaultValue="Admin User"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Primary Email</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="admin@qcu.edu.ph"
            defaultValue="admin@qcu.edu.ph"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Backup Email</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="backup@qcu.edu.ph"
          />
          <p className="form-help">Used for account recovery and important notifications</p>
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input 
            type="tel" 
            className="form-input" 
            placeholder="+63 912 345 6789"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Account Preferences</h3>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select className="form-select">
            <option value="en">English</option>
            <option value="fil">Filipino</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Time Zone</label>
          <select className="form-select">
            <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
            <option value="UTC">UTC (UTC+0)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Password & Authentication</h3>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <div className="password-input-group">
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Enter current password"
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="password-input-group">
            <input 
              type={showNewPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Enter new password"
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="password-input-group">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Confirm new password"
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button className="btn-secondary">
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Two-Factor Authentication</h3>
        <div className="security-item">
          <div className="security-info">
            <h4 className="security-title">SMS Authentication</h4>
            <p className="security-description">Receive verification codes via SMS</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="security-item">
          <div className="security-info">
            <h4 className="security-title">Email Authentication</h4>
            <p className="security-description">Receive verification codes via email</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Session Management</h3>
        <div className="form-group">
          <label className="form-label">Session Timeout</label>
          <select className="form-select">
            <option value="15">15 minutes</option>
            <option value="30" selected>30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <button className="btn-secondary">
          <AlertCircle className="w-4 h-4" />
          Sign Out All Devices
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Email Notifications</h3>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">System Alerts</h4>
            <p className="notification-description">Critical system notifications and updates</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Device Status Changes</h4>
            <p className="notification-description">Notifications when device status changes</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Problem Reports</h4>
            <p className="notification-description">New problem reports from users</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Contact Messages</h4>
            <p className="notification-description">New contact form submissions</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">In-App Notifications</h3>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Desktop Notifications</h4>
            <p className="notification-description">Show browser notifications</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Sound Alerts</h4>
            <p className="notification-description">Play sound for important notifications</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3 className="section-title">Data Management</h3>
        <div className="system-item">
          <div className="system-info">
            <h4 className="system-title">Export Data</h4>
            <p className="system-description">Download all system data as CSV/JSON</p>
          </div>
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="system-item">
          <div className="system-info">
            <h4 className="system-title">Import Data</h4>
            <p className="system-description">Upload data from CSV/JSON files</p>
          </div>
          <button className="btn-secondary">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
        <div className="system-item">
          <div className="system-info">
            <h4 className="system-title">Database Backup</h4>
            <p className="system-description">Create a complete system backup</p>
          </div>
          <button className="btn-secondary">
            <Database className="w-4 h-4" />
            Backup
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">System Preferences</h3>
        <div className="form-group">
          <label className="form-label">Default Dashboard View</label>
          <select className="form-select">
            <option value="overview">Overview</option>
            <option value="devices" selected>Devices</option>
            <option value="problems">Problems</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Items Per Page</label>
          <select className="form-select">
            <option value="10">10 items</option>
            <option value="25" selected>25 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Auto-refresh Interval</label>
          <select className="form-select">
            <option value="30">30 seconds</option>
            <option value="60" selected>1 minute</option>
            <option value="300">5 minutes</option>
            <option value="0">Disabled</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Maintenance</h3>
        <div className="system-item">
          <div className="system-info">
            <h4 className="system-title">Clear Cache</h4>
            <p className="system-description">Clear application cache and temporary files</p>
          </div>
          <button className="btn-secondary">
            Clear Cache
          </button>
        </div>
        <div className="system-item">
          <div className="system-info">
            <h4 className="system-title">System Logs</h4>
            <p className="system-description">View and download system logs</p>
          </div>
          <button className="btn-secondary">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderAccountSettings();
    }
  };

  return (
    <div className="admin-settings-modal-overlay" onClick={onClose}>
      <div className="admin-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Admin Settings</h2>
          <button className="close-button" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main">
            {renderContent()}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
