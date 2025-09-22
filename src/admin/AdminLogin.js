import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Zap } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { adminLogin, loading } = useAdminAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug: Let's see what the API actually returns
    console.log('=== DEBUG: Testing API Response ===');
    try {
      const debugResponse = await fetch('https://api-qcusolarcharge.up.railway.app/login/postLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      
      console.log('Debug - Response status:', debugResponse.status);
      console.log('Debug - Response ok:', debugResponse.ok);
      console.log('Debug - Response headers:', Object.fromEntries(debugResponse.headers.entries()));
      
      const debugData = await debugResponse.text();
      console.log('Debug - Raw response:', debugData);
      
      try {
        const parsedData = JSON.parse(debugData);
        console.log('Debug - Parsed response:', parsedData);
        console.log('Debug - Response keys:', Object.keys(parsedData || {}));
      } catch (parseError) {
        console.log('Debug - Could not parse as JSON:', parseError);
      }
    } catch (debugError) {
      console.log('Debug - API call failed:', debugError);
    }
    console.log('=== END DEBUG ===');

    try {
      const result = await adminLogin({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        showSuccess('Welcome to EcoCharge Admin Panel!');
        navigate('/admin/dashboard');
      } else {
        showError(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An unexpected error occurred during login');
    }
  };

  const handleLogoClick = () => {
    // Navigate to home page
    navigate('/');
  };

  return (
    <div id="admin-login-page">
      <div className="flex items-center justify-center min-h-screen">
        <div className="container">
          {/* Logo/Header */}
          <div className="header">
            <div className="logo-container" onClick={handleLogoClick}>
              <Zap className="logo-icon" />
            </div>
            <h1 className="title" onClick={handleLogoClick}>QCU EcoCharge</h1>
            <div className="badge">
              <Shield className="badge-icon" />
              Admin Portal
            </div>
          </div>

          {/* Login Card */}
          <div className="login-card">
            <div className="card-header">
              <h2 className="card-title">Administrator Portal</h2>
              <p className="card-description">
                Secure access to QCU EcoCharge administrative controls and system management
              </p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="password-container">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="button-icon" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Admin Access Notice */}
              <div className="admin-notice">
                <p className="notice-title">Admin Access Only</p>
                <div className="notice-text">
                  <p>This portal is restricted to authorized administrators only.</p>
                  <p>Please contact your system administrator for access credentials.</p>
                  <p>All login attempts are logged and monitored for security purposes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <p>This is a secure admin portal. All actions are logged and monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
