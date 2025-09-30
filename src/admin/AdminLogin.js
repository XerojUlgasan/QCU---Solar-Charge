import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Zap, Mail, Lock, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import logo from '../logo.svg';
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
  
  // Forgot Password Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'password', 'success'
  const [isResetting, setIsResetting] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sentOtp, setSentOtp] = useState(''); // Store the generated OTP for verification

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

  const resetForgotPasswordModal = () => {
    setForgotPasswordStep('email');
    setForgotEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setSentOtp('');
    setIsResetting(false);
  };

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      showError('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    setIsResetting(true);

    try {
      // Mock OTP generation and sending
      setTimeout(() => {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSentOtp(generatedOtp);
        
        // In a real app, this would send an email with the OTP
        showSuccess(`OTP sent to ${forgotEmail}. Demo OTP: ${generatedOtp}`);
        setForgotPasswordStep('otp');
        setIsResetting(false);
      }, 2000);
    } catch (error) {
      showError('Failed to send OTP. Please try again.');
      setIsResetting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      showError('Please enter the OTP code');
      return;
    }

    if (otpCode !== sentOtp) {
      showError('Invalid OTP code. Please try again.');
      return;
    }

    setIsResetting(true);

    setTimeout(() => {
      showSuccess('OTP verified successfully!');
      setForgotPasswordStep('password');
      setIsResetting(false);
    }, 1000);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setIsResetting(true);

    try {
      // Mock password reset
      setTimeout(() => {
        showSuccess('Password reset successfully!');
        setForgotPasswordStep('success');
        setIsResetting(false);
      }, 2000);
    } catch (error) {
      showError('Failed to reset password. Please try again.');
      setIsResetting(false);
    }
  };

  return (
    <div id="admin-login-page">
      <div className="flex items-center justify-center min-h-screen">
        <div className="container">
          {/* Logo/Header */}
          <div className="header">
            <div className="logo-container" onClick={handleLogoClick}>
              <img 
                src={logo} 
                alt="QCU EcoCharge Logo" 
                className="logo-icon"
              />
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

              {/* Forgot Password Link */}
              <div className="forgot-password-container">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setIsModalOpen(true)}
                >
                  Forgot your password?
                </button>
              </div>

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

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="modal-bg" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header-new">
              <h2 className="modal-title-new">
                {forgotPasswordStep === 'email' && 'Reset Password'}
                {forgotPasswordStep === 'otp' && 'Verify Your Email'}
                {forgotPasswordStep === 'password' && 'Create New Password'}
                {forgotPasswordStep === 'success' && 'Success!'}
              </h2>
              <button
                className="modal-close-new"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForgotPasswordModal();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="modal-body-new">
              {forgotPasswordStep === 'email' && (
                <div className="step-content">
                  <div className="step-icon-new email-icon-new">
                    <Mail className="h-8 w-8" />
                  </div>
                  <p className="step-text">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@ecocharge.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isResetting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSendOtp}
                      disabled={isResetting}
                    >
                      {isResetting ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 'otp' && (
                <div className="step-content">
                  <div className="step-icon-new otp-icon-new">
                    <Shield className="h-8 w-8" />
                  </div>
                  <p className="step-text">
                    We've sent a 6-digit verification code to {forgotEmail}. Please enter it below.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label">Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="input-field otp-input"
                      required
                    />
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setForgotPasswordStep('email')}
                      disabled={isResetting}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleVerifyOtp}
                      disabled={isResetting}
                    >
                      {isResetting ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>

                  <div className="resend-section">
                    <button
                      type="button"
                      className="resend-link"
                      onClick={handleSendOtp}
                      disabled={isResetting}
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 'password' && (
                <div className="step-content">
                  <div className="step-icon-new password-icon-new">
                    <Lock className="h-8 w-8" />
                  </div>
                  <p className="step-text">
                    Create a new password for your admin account. Make sure it's strong and secure.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <div className="password-field">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="input-field"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Confirm Password</label>
                    <div className="password-field">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="password-rules">
                    <p>Password requirements:</p>
                    <ul>
                      <li>At least 8 characters long</li>
                      <li>Contains both letters and numbers</li>
                      <li>Use a unique password</li>
                    </ul>
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setForgotPasswordStep('otp')}
                      disabled={isResetting}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleResetPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 'success' && (
                <div className="step-content">
                  <div className="step-icon-new success-icon-new">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  
                  <h3 className="success-title">Password Reset Successful!</h3>
                  <p className="step-text">
                    Your admin password has been successfully reset. You can now use your new password to sign in.
                  </p>

                  <button
                    type="button"
                    className="btn-primary btn-full"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForgotPasswordModal();
                    }}
                  >
                    Continue to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
