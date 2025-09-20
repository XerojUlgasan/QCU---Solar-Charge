import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Home, 
  Smartphone, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/AdminHeader.css';

const AdminHeader = ({ title, navigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigateToRoute = useNavigate();

  const handleLogout = () => {
    // Clear admin login state
    localStorage.removeItem('adminLoggedIn');
    // Navigate to admin login page
    navigateToRoute('/admin');
  };

  const menuItems = [
    {
      route: 'admin-dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />
    },
    {
      route: 'admin-devices',
      label: 'Devices',
      icon: <Smartphone className="w-4 h-4" />
    },
    {
      route: 'admin-problems',
      label: 'Problem Reports',
      icon: <AlertTriangle className="w-4 h-4" />
    }
  ];

  return (
    <header id="admin-header">
      <div className="header-container">
        {/* Logo & Title */}
        <div className="logo-section">
          <div className="logo-group">
            <div className="logo-icon-container">
              <Zap className="logo-icon" />
            </div>
            <span className="logo-text">QCU EcoCharge</span>
            <div className="admin-badge">
              Admin
            </div>
          </div>
          <div className="divider"></div>
          <h1 className="page-title">{title}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {menuItems.map((item) => (
            <button
              key={item.route}
              className="nav-button"
              onClick={() => navigate(item.route)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="actions-section">
          {/* Dark mode toggle */}
          <button
            className="action-button"
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Settings */}
          <button className="action-button">
            <Settings className="h-4 w-4" />
          </button>

          {/* Logout */}
          <button className="action-button" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-title-section">
              <h1 className="mobile-page-title">{title}</h1>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.route}
                className="mobile-nav-button"
                onClick={() => {
                  navigate(item.route);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
