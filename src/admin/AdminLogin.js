import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Zap, Mail, Lock, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sendOtp, verifyOtp, changePassword, API_BASE_URL } from '../utils/api';
import logo from '../logo.svg';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { adminLogin, loading, isAdminAuthenticated } = useAdminAuth();
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!loading && isAdminAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate('/admin/dashboard', { replace: true });
    }
  }, [loading, isAdminAuthenticated, navigate]);
  const { isDarkMode } = useTheme();

  // State declarations
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
  const [resendTimer, setResendTimer] = useState(0); // Timer for resend functionality
  const [loginAttempts, setLoginAttempts] = useState(0); // Track login attempts
  const [cooldownEndTime, setCooldownEndTime] = useState(null); // Track cooldown end time
  const [cooldownTimer, setCooldownTimer] = useState(0); // Timer for cooldown display

  // Load login attempts and cooldown from localStorage on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const storedCooldown = localStorage.getItem('adminLoginCooldown');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }
    
    if (storedCooldown) {
      const cooldownEnd = parseInt(storedCooldown, 10);
      const now = Date.now();
      
      if (cooldownEnd > now) {
        setCooldownEndTime(cooldownEnd);
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        setCooldownTimer(remaining);
      } else {
        // Cooldown expired, clear it
        localStorage.removeItem('adminLoginCooldown');
        localStorage.removeItem('adminLoginAttempts');
        setLoginAttempts(0);
        setCooldownEndTime(null);
      }
    }
  }, []);

  // Handle cooldown timer countdown
  useEffect(() => {
    let interval;
    if (cooldownEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((cooldownEndTime - now) / 1000);
        
        if (remaining > 0) {
          setCooldownTimer(remaining);
        } else {
          // Cooldown expired
          setCooldownTimer(0);
          setCooldownEndTime(null);
          setLoginAttempts(0);
          localStorage.removeItem('adminLoginCooldown');
          localStorage.removeItem('adminLoginAttempts');
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownEndTime]);

  // Handle browser extension errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      // Check if it's a browser extension error
      if (event.reason && event.reason.message && 
          event.reason.message.includes('listener indicated an asynchronous response')) {
        console.warn('Browser extension communication error detected:', event.reason.message);
        // Prevent the error from showing in console
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Handle resend timer
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is in cooldown
    if (cooldownEndTime && Date.now() < cooldownEndTime) {
      const remainingMinutes = Math.ceil((cooldownEndTime - Date.now()) / 60000);
      showError(`Too many failed login attempts. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} before trying again.`);
      return;
    }

    try {
      const result = await adminLogin({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        // Reset attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLoginCooldown');
        
        showSuccess('Welcome to EcoCharge Admin Panel!');
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        // Increment failed attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('adminLoginAttempts', newAttempts.toString());
        
        const msg = (result.error || '').toString();
        const isInvalid = /invalid credentials/i.test(msg) || /^HTTP\s*401/i.test(msg) || /401/.test(msg);
        
        if (newAttempts >= 5) {
          // Start 3-minute cooldown
          const cooldownEnd = Date.now() + (3 * 60 * 1000); // 3 minutes
          setCooldownEndTime(cooldownEnd);
          setCooldownTimer(180); // 3 minutes in seconds
          localStorage.setItem('adminLoginCooldown', cooldownEnd.toString());
          localStorage.setItem('adminLoginAttempts', '0'); // Reset attempts after cooldown starts
          
          showError('Too many failed login attempts. Please wait 3 minutes before trying again.');
        } else {
          const remainingAttempts = 5 - newAttempts;
          if (isInvalid) {
            showError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
          } else {
            showError(`Login failed. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Increment failed attempts on error too
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('adminLoginAttempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        // Start 3-minute cooldown
        const cooldownEnd = Date.now() + (3 * 60 * 1000); // 3 minutes
        setCooldownEndTime(cooldownEnd);
        setCooldownTimer(180); // 3 minutes in seconds
        localStorage.setItem('adminLoginCooldown', cooldownEnd.toString());
        localStorage.setItem('adminLoginAttempts', '0'); // Reset attempts after cooldown starts
        
        showError('Too many failed login attempts. Please wait 3 minutes before trying again.');
      } else {
        const remainingAttempts = 5 - newAttempts;
        showError(`An unexpected error occurred. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
      }
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
    setResendTimer(0);
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
      console.log('=== ADMIN LOGIN OTP SEND DEBUG ===');
      console.log('Sending OTP to:', forgotEmail);
      
      const response = await sendOtp(forgotEmail);
      
      console.log('OTP Response status:', response.status);
      console.log('OTP Response ok:', response.ok);
      console.log('OTP Response type:', typeof response);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('OTP Response data:', responseData);
        
        // Check if response indicates invalid email even with 200 status
        if (responseData.success === false && responseData.message === 'Invalid email') {
          console.log('Response indicates invalid email despite 200 status');
          showError('Invalid email address or email not found in our system.');
          setIsResetting(false);
          return;
        }
        
        // If the API returns an OTP, store it for verification
        if (responseData.otp) {
          setSentOtp(responseData.otp);
          console.log('Stored OTP for verification:', responseData.otp);
        }
        
        // Show different message for demo mode
        if (responseData.demo) {
          showSuccess(`Demo OTP generated: ${responseData.otp}. Backend endpoint not implemented yet.`);
        } else {
          showSuccess(`Email accepted! OTP sent successfully to ${forgotEmail}. Please check your email and spam folder.`);
        }
        
        setForgotPasswordStep('otp');
        setResendTimer(60); // Start 60-second timer
        setIsResetting(false);
      } else {
        const errorData = await response.text();
        console.error('Send OTP failed:', response.status, errorData);
        
        if (response.status === 400) {
          showError('Invalid email address or email not found in our system.');
        } else if (response.status === 401) {
          showError('Invalid email address or email not found in our system.');
        } else if (response.status === 404) {
          showError('Email address not found in our system.');
        } else if (response.status === 500) {
          showError('Server error. Please try again later.');
        } else {
          showError(`Failed to send OTP. Status: ${response.status}`);
        }
        setIsResetting(false);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showError('Network error. Please check your connection and try again.');
      setIsResetting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      showError(`Please wait ${resendTimer} seconds before requesting another OTP`);
      return;
    }

    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      showError('Please enter the OTP code');
      return;
    }

    if (!forgotEmail) {
      showError('Email not found. Please restart the process.');
      return;
    }

    setIsResetting(true);

    try {
      console.log('=== ADMIN LOGIN OTP VERIFY DEBUG ===');
      console.log('Verifying OTP:', otpCode);
      console.log('For email:', forgotEmail);
      
      const response = await verifyOtp(otpCode, forgotEmail);
      
      console.log('Verify Response status:', response.status);
      console.log('Verify Response ok:', response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Verify Response data:', responseData);
        console.log('=== OTP VERIFY SUCCESS ===');
        
      showSuccess('OTP verified successfully!');
      setForgotPasswordStep('password');
        setIsResetting(false);
      } else {
        const errorData = await response.text();
        console.error('Verify OTP failed:', response.status, errorData);
        
        if (response.status === 400) {
          showError('Invalid OTP code. Please check your code and try again.');
        } else if (response.status === 401) {
          showError('Invalid OTP code. Please check your code and try again.');
        } else if (response.status === 404) {
          showError('OTP not found or expired. Please request a new one.');
        } else if (response.status === 500) {
          // Check if it's actually a wrong OTP by looking at response content
          if (errorData.toLowerCase().includes('invalid') || 
              errorData.toLowerCase().includes('wrong') || 
              errorData.toLowerCase().includes('incorrect') ||
              errorData.toLowerCase().includes('otp')) {
            showError('Invalid OTP code. Please check your code and try again.');
          } else {
            showError('Server error. Please try again later.');
          }
        } else {
          showError(`Failed to verify OTP. Status: ${response.status}`);
        }
        setIsResetting(false);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showError('Network error. Please check your connection and try again.');
      setIsResetting(false);
    }
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

    // Check if password contains both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      showError('Password must contain both letters and numbers');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setIsResetting(true);

    try {
      console.log('=== ADMIN LOGIN CHANGE PASSWORD DEBUG ===');
      console.log('Changing password for email:', forgotEmail);
      console.log('Using OTP:', otpCode);
      console.log('New password:', newPassword);
      
      const response = await changePassword(otpCode, forgotEmail, newPassword);
      
      console.log('Change Password Response status:', response.status);
      console.log('Change Password Response ok:', response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Change Password Response data:', responseData);
        console.log('=== CHANGE PASSWORD SUCCESS ===');
        
        showSuccess('Password reset successfully!');
        setForgotPasswordStep('success');
        setIsResetting(false);
      } else {
        const errorData = await response.text();
        console.error('Change Password failed:', response.status, errorData);
        
        if (response.status === 400) {
          showError('Invalid OTP or password requirements not met. Please try again.');
        } else if (response.status === 404) {
          showError('OTP expired or not found. Please request a new one.');
        } else if (response.status === 500) {
          showError('Server error. Please try again later.');
        } else {
          showError(`Failed to reset password. Status: ${response.status}`);
        }
        setIsResetting(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Network error. Please check your connection and try again.');
      setIsResetting(false);
    }
  };

  return (
    <div id="admin-login-page" className={isDarkMode ? '' : 'light'} style={{
      backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="container">
          {/* Logo/Header */}
          <div className="header">
            <div className="logo-container" onClick={handleLogoClick} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '9rem',
              height: '9rem',
              margin: '0 auto 1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <img 
                src={logo} 
                alt="QCU EcoCharge Logo" 
                className="logo-icon"
                style={{
                  width: '9rem',
                  height: '9rem',
                  color: '#ffffff'
                }}
              />
            </div>
            <h1 className="title" onClick={handleLogoClick} style={{
              color: isDarkMode ? '#ffffff' : '#1f2937',
              fontSize: '2rem',
              fontWeight: '700',
              marginTop: '-3rem'
            }}>QCU EcoCharge</h1>
            <div className="badge inline-block mb-4 w-fit" style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '10px',
              backgroundColor: isDarkMode ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.1)',
              color: isDarkMode ? '#fb923c' : '#fb923c',
              border: isDarkMode ? 'none' : '1px solid #f59e0b',
              boxShadow: isDarkMode ? 'none' : '0 0 20px rgba(251, 146, 60, 0.2)'
            }}>
              <Shield className="badge-icon" />
              Admin Portal
            </div>
          </div>

          {/* Login Card */}
          <div className="login-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            marginTop: '-2rem'
          }}>
            <div className="card-header">
              <h2 className="card-title" style={{
                color: isDarkMode ? '#ffffff' : '#1f2937',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>Administrator Portal</h2>
              <p className="card-description" style={{
                color: isDarkMode ? '#9aa3b2' : '#374151',
                fontSize: '0.875rem'
              }}>
                Secure access to QCU EcoCharge administrative controls and system management
              </p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username" className="form-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Username or Email</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="form-input"
                    style={{
                      backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                      color: isDarkMode ? '#ffffff' : '#1f2937'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Password</label>
                  <div className="password-container">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="form-input"
                      style={{
                        backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                        color: isDarkMode ? '#ffffff' : '#1f2937'
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}
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
                  disabled={loading || (cooldownEndTime && Date.now() < cooldownEndTime)}
                  style={{
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    opacity: (cooldownEndTime && Date.now() < cooldownEndTime) ? 0.5 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (cooldownEndTime && Date.now() < cooldownEndTime) ? (
                    <>
                      <span>Cooldown: {Math.floor(cooldownTimer / 60)}:{(cooldownTimer % 60).toString().padStart(2, '0')}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="button-icon" />
                      Sign In
                    </>
                  )}
                </button>
                
                {/* Login attempts warning */}
                {loginAttempts > 0 && loginAttempts < 5 && !cooldownEndTime && (
                  <div className="login-attempts-warning" style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#f59e0b' : '#d97706',
                    textAlign: 'center'
                  }}>
                    {5 - loginAttempts} attempt{5 - loginAttempts > 1 ? 's' : ''} remaining before cooldown
                  </div>
                )}
              </form>

              {/* Forgot Password Link */}
              <div className="forgot-password-container">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setIsModalOpen(true)}
                  style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Admin Access Notice */}
              <div className="admin-notice" style={{
                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <p className="notice-title" style={{color: isDarkMode ? '#ef4444' : '#dc2626'}}>Admin Access Only</p>
                <div className="notice-text" style={{color: isDarkMode ? '#9ca3af' : '#6b7280'}}>
                  <p>This portal is restricted to authorized administrators only.</p>
                  <p>Please contact your system administrator for access credentials.</p>
                  <p>All login attempts are logged and monitored for security purposes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <p style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>This is a secure admin portal. All actions are logged and monitored.</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="modal-bg">
          <div className="modal-box" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb',
            boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div className="modal-header-new" style={{
              borderBottom: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb'
            }}>
              <h2 className="modal-title-new" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>
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
                style={{
                  color: isDarkMode ? '#9aa3b2' : '#6b7280',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDarkMode ? '#ffffff' : '#374151';
                  e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDarkMode ? '#9aa3b2' : '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
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
                  <p className="step-text" style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@ecocharge.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="input-field"
                      style={{
                        backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                        color: isDarkMode ? '#ffffff' : '#1f2937'
                      }}
                    />
                  </div>

                  <div className="button-group">
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
                  <p className="step-text" style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>
                    We've sent a 6-character verification code to {forgotEmail}. Please enter it below.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Verification Code</label>
                    <div className="otp-container">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                          key={index}
                      type="text"
                          className="otp-input-box"
                          value={otpCode[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                            if (value.length <= 1) {
                              const newOtp = otpCode.split('');
                              newOtp[index] = value;
                              setOtpCode(newOtp.join(''));
                              
                              // Auto-focus next box
                              if (value && index < 5) {
                                const nextBox = document.querySelector(`.otp-input-box:nth-child(${index + 2})`);
                                if (nextBox) nextBox.focus();
                              }
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '');
                            if (pastedData.length >= 6) {
                              // Fill all boxes with pasted data
                              const otpArray = pastedData.substring(0, 6).split('');
                              setOtpCode(otpArray.join(''));
                              
                              // Focus the last box
                              setTimeout(() => {
                                const lastBox = document.querySelector(`.otp-input-box:nth-child(6)`);
                                if (lastBox) lastBox.focus();
                              }, 0);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                              const prevBox = document.querySelector(`.otp-input-box:nth-child(${index})`);
                              if (prevBox) prevBox.focus();
                            }
                          }}
                          maxLength={1}
                      required
                          style={{
                            backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                            border: isDarkMode ? '2px solid #1f2937' : '2px solid #d1d5db',
                            color: isDarkMode ? '#ffffff' : '#1f2937'
                          }}
                    />
                      ))}
                    </div>
                  </div>

                  <div className="button-group">
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
                      onClick={handleResendOtp}
                      disabled={isResetting || resendTimer > 0}
                    >
                      {resendTimer > 0 
                        ? `Resend OTP in ${resendTimer}s` 
                        : "Didn't receive the code? Resend OTP"
                      }
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 'password' && (
                <div className="step-content">
                  <div className="step-icon-new password-icon-new">
                    <Lock className="h-8 w-8" />
                  </div>
                  <p className="step-text" style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>
                    Create a new password for your admin account. Make sure it's strong and secure.
                  </p>
                  
                  <div className="input-group">
                    <label className="input-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>New Password</label>
                    <div className="password-field">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="input-field"
                        style={{
                          backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                          color: isDarkMode ? '#ffffff' : '#1f2937'
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="input-help" style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>Password must be at least 8 characters and contain both letters and numbers</p>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Confirm Password</label>
                    <div className="password-field">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field"
                        style={{
                          backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                          color: isDarkMode ? '#ffffff' : '#1f2937'
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="password-rules" style={{
                    backgroundColor: isDarkMode ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.05))' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.05))',
                    border: isDarkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <p style={{color: isDarkMode ? '#22c55e' : '#16a34a'}}>Password requirements:</p>
                    <ul style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>
                      <li>At least 8 characters long</li>
                      <li>Contains both letters and numbers</li>
                      <li>Use a unique password</li>
                    </ul>
                  </div>

                  <div className="button-group">
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
                  
                  <h3 className="success-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Password Reset Successful!</h3>
                  <p className="step-text" style={{color: isDarkMode ? '#9aa3b2' : '#6b7280'}}>
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

// Test functions for debugging - can be called from browser console
window.testOtpApi = async (email) => {
  console.log('=== MANUAL SEND OTP TEST ===');
  console.log('Testing with email:', email);
  
  try {
    const response = await fetch(API_BASE_URL + '/admin/sendOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    console.log('Test Response Status:', response.status);
    console.log('Test Response OK:', response.ok);
    console.log('Test Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Test Response Data:', data);
      console.log('✅ SEND OTP TEST SUCCESS');
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('Test Error Response:', errorText);
      console.log('❌ SEND OTP TEST FAILED');
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('Test Network Error:', error);
    console.log('❌ SEND OTP TEST NETWORK ERROR');
    return { success: false, error: error.message };
  }
};

window.testVerifyOtpApi = async (otp, email) => {
  console.log('=== MANUAL VERIFY OTP TEST ===');
  console.log('Testing OTP:', otp);
  console.log('Testing email:', email);
  
  try {
    const response = await fetch(API_BASE_URL + '/admin/verifyOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp, email })
    });
    
    console.log('Test Response Status:', response.status);
    console.log('Test Response OK:', response.ok);
    console.log('Test Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Test Response Data:', data);
      console.log('✅ VERIFY OTP TEST SUCCESS');
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('Test Error Response:', errorText);
      console.log('❌ VERIFY OTP TEST FAILED');
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('Test Network Error:', error);
    console.log('❌ VERIFY OTP TEST NETWORK ERROR');
    return { success: false, error: error.message };
  }
};

window.testChangePasswordApi = async (otp, email, newPassword) => {
  console.log('=== MANUAL CHANGE PASSWORD TEST ===');
  console.log('Testing OTP:', otp);
  console.log('Testing email:', email);
  console.log('Testing new password:', newPassword);
  
  try {
    const response = await fetch(API_BASE_URL + '/admin/changePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp, email, new_password: newPassword })
    });
    
    console.log('Test Response Status:', response.status);
    console.log('Test Response OK:', response.ok);
    console.log('Test Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Test Response Data:', data);
      console.log('✅ CHANGE PASSWORD TEST SUCCESS');
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('Test Error Response:', errorText);
      console.log('❌ CHANGE PASSWORD TEST FAILED');
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('Test Network Error:', error);
    console.log('❌ CHANGE PASSWORD TEST NETWORK ERROR');
    return { success: false, error: error.message };
  }
};

export default AdminLogin;
