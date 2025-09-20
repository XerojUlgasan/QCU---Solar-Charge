import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Zap } from 'lucide-react';
import '../styles/AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication - in real app, this would call an API
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'ecocharge2024') {
        // toast.success('Welcome to EcoCharge Admin Panel!');
        alert('Welcome to EcoCharge Admin Panel!');
        onLogin();
      } else {
        // toast.error('Invalid credentials. Please try again.');
        alert('Invalid credentials. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div id="admin-login-page">
      <div className="flex items-center justify-center min-h-screen">
        <div className="container">
          {/* Logo/Header */}
          <div className="header">
            <div className="logo-container">
              <Zap className="logo-icon" />
            </div>
            <h1 className="title">QCU EcoCharge</h1>
            <div className="badge">
              <Shield className="badge-icon" />
              Admin Portal
            </div>
          </div>

          {/* Login Card */}
          <div className="login-card">
            <div className="card-header">
              <h2 className="card-title">Admin Login</h2>
              <p className="card-description">
                Enter your credentials to access the admin dashboard
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
                  disabled={isLoading}
                >
                  {isLoading ? (
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

              {/* Demo Credentials */}
              <div className="demo-credentials">
                <p className="demo-title">Demo Credentials:</p>
                <div className="demo-text">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> ecocharge2024</p>
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
