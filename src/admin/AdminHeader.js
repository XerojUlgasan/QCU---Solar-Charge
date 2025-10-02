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
import AdminSettingsModal from '../components/AdminSettingsModal';
import logo from '../logo.svg';
import '../styles/AdminHeader.css';

const AdminHeader = ({ title, navigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showSuccess } = useNotification();
  const { openModal: openLogoutModal } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
    <header id="admin-header" className={`${isScrolled ? 'scrolled' : ''} ${isDarkMode ? '' : 'light'}`} style={{
      backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
      boxShadow: isDarkMode ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
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
            <span className="logo-text" onClick={handleLogoClick} style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>QCU EcoCharge</span>
            <div className="admin-badge" style={{
              backgroundColor: isDarkMode ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.1)',
              color: isDarkMode ? '#fb923c' : '#d97706',
              border: isDarkMode ? 'none' : '1px solid #f59e0b',
              boxShadow: isDarkMode ? 'none' : '0 0 20px rgba(251, 146, 60, 0.2)'
            }}>
              Admin
            </div>
          </div>
          <div className="divider" style={{backgroundColor: isDarkMode ? '#9aa3b2' : '#d1d5db'}}></div>
          <h1 className="page-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{title}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {menuItems.map((item) => (
            <button
              key={item.route}
              className="nav-button"
              onClick={() => navigate(item.route)}
              style={{
                color: isDarkMode ? '#9aa3b2' : '#1f2937',
                backgroundColor: 'transparent',
                border: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
              }}
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
            style={{
              color: isDarkMode ? '#9aa3b2' : '#1f2937',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
              e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
            }}
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
            onClick={() => setIsSettingsModalOpen(true)}
            title="Settings"
            style={{
              color: isDarkMode ? '#9aa3b2' : '#1f2937',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
              e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
            }}
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Logout */}
          <button 
            className="action-button" 
            onClick={handleLogout}
            style={{
              color: isDarkMode ? '#9aa3b2' : '#1f2937',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
              e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
            }}
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              color: isDarkMode ? '#9aa3b2' : '#1f2937',
              backgroundColor: 'transparent',
              border: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
              e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
            }}
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
        <div className="mobile-menu" style={{
          backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
          borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
          boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div className="mobile-menu-content">
            <div className="mobile-title-section">
              <h1 className="mobile-page-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{title}</h1>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.route}
                className="mobile-nav-button"
                onClick={() => {
                  navigate(item.route);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  color: isDarkMode ? '#9aa3b2' : '#1f2937',
                  backgroundColor: 'transparent',
                  border: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                  e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <AdminSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </header>
  );
};

export default AdminHeader;
