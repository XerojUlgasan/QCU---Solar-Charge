import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Home, 
  Smartphone, 
  AlertTriangle, 
  Mail,
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLogout } from '../contexts/LogoutContext';
import logo from '../logo.svg';
import '../styles/AdminHeader.css';

const AdminHeader = ({ title, navigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showSuccess } = useNotification();
  const { openModal: openLogoutModal } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigateToRoute = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    openLogoutModal(() => {
      // Clear admin login state
      localStorage.removeItem('adminLoggedIn');
      // Show success notification
      showSuccess('Successfully logged out!');
      // Navigate to admin login page
      navigateToRoute('/admin');
    });
  };

  const handleLogoClick = () => {
    // Navigate to home page
    navigateToRoute('/');
  };

  const menuItems = [
    {
      route: 'admin-dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />
    },
    {
      route: 'admin-devices',
      label: 'Devices',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      route: 'admin-problems',
      label: 'Problem Reports',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      route: 'admin-contact',
      label: 'Contact Messages',
      icon: <Mail className="w-5 h-5" />
    }
  ];

  return (
    <header id="admin-header" className={isScrolled ? 'scrolled' : ''}>
      <div className="header-container">
        {/* Logo & Title */}
        <div className="logo-section">
          <div className="logo-group">
            <img 
              src={logo} 
              alt="QCU EcoCharge Logo" 
              className="logo-icon"
              onClick={handleLogoClick}
            />
            <span className="logo-text" onClick={handleLogoClick}>QCU EcoCharge</span>
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
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Settings */}
          <button
            className="action-button"
            onClick={() => {
              // TODO: Add settings functionality
              console.log('Settings clicked');
            }}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Logout */}
          <button className="action-button" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
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
