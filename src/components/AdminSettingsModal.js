import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Key, 
  Shield, 
  User, 
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Loader2,
  UserCheck
} from 'lucide-react';
import { getAdminInformation, setAdminInformation, changeAdminUsername, changeAdminPassword, sendOtp } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/AdminSettingsModal.css';

const AdminSettingsModal = ({ isOpen, onClose }) => {
  const { showSuccess } = useNotification();
  const { admin } = useAdminAuth();
  const { isDarkMode } = useTheme();

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
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Username change state
  const [showUsernamePassword, setShowUsernamePassword] = useState(false);
  const [usernameChangeData, setUsernameChangeData] = useState({
    new_username: '',
    current_password: ''
  });
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Password change state
  const [passwordChangeData, setPasswordChangeData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  
  // Confirmation modals
  const [showUsernameConfirmation, setShowUsernameConfirmation] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  // Admin information state
  const [adminInfo, setAdminInfo] = useState({
    full_name: '',
    primary_email: '',
    backup_email: ''
  });
  const [originalAdminInfo, setOriginalAdminInfo] = useState({
    full_name: '',
    primary_email: '',
    backup_email: ''
  });
  const [currentUsername, setCurrentUsername] = useState(admin?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> }
  ];

  // Reset forgot password state when switching to security tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'security') {
      resetForgotPasswordState();
    }
  };

  // Load admin information when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAdminInformation();
      // Update current username from admin context
      if (admin?.username) {
        setCurrentUsername(admin.username);
      }
    } else {
      // Reset forgot password state when modal closes
      resetForgotPasswordState();
    }
  }, [isOpen, admin]);

  const loadAdminInformation = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAdminInformation();
      console.log('Load response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded admin data:', data);
        setAdminInfo({
          full_name: data.full_name || '',
          primary_email: data.primary_email || '',
          backup_email: data.backup_email || ''
        });
        setOriginalAdminInfo({
          full_name: data.full_name || '',
          primary_email: data.primary_email || '',
          backup_email: data.backup_email || ''
        });
      } else {
        const errorData = await response.text();
        console.error('Load failed:', response.status, errorData);
        setError('Failed to load admin information');
      }
    } catch (error) {
      console.error('Error loading admin information:', error);
      setError('Failed to load admin information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Input change - ${field}:`, value);
    setAdminInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts fixing the issue
    if (error) {
      // Check if the error is related to this field and if it's now valid
      if (error.includes('Full name is required') && field === 'full_name' && value.trim()) {
        setError('');
      } else if (error.includes('Primary email is required') && field === 'primary_email' && value.trim()) {
        setError('');
      } else if (error.includes('valid primary email') && field === 'primary_email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          setError('');
        }
      } else if (error.includes('valid backup email') && field === 'backup_email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || emailRegex.test(value)) {
          setError('');
        }
      }
    }
  };

  const hasChanges = () => {
    const changes = {
      full_name: adminInfo.full_name !== originalAdminInfo.full_name,
      primary_email: adminInfo.primary_email !== originalAdminInfo.primary_email,
      backup_email: adminInfo.backup_email !== originalAdminInfo.backup_email
    };
    console.log('Change detection:', changes);
    console.log('Current values:', adminInfo);
    console.log('Original values:', originalAdminInfo);
    return changes.full_name || changes.primary_email || changes.backup_email;
  };

  const handleSave = () => {
    if (!hasChanges()) {
      return;
    }

    // Validate required fields
    if (!adminInfo.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!adminInfo.primary_email.trim()) {
      setError('Primary email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminInfo.primary_email)) {
      setError('Please enter a valid primary email address');
      return;
    }
    if (adminInfo.backup_email && !emailRegex.test(adminInfo.backup_email)) {
      setError('Please enter a valid backup email address');
      return;
    }

    setShowSaveConfirmation(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      // Debug: Log the exact data being sent
      const dataToSend = {
        full_name: adminInfo.full_name,
        primary_email: adminInfo.primary_email,
        backup_email: adminInfo.backup_email
      };
      
      console.log('Saving admin info:', dataToSend);
      console.log('Data types:', {
        full_name: typeof dataToSend.full_name,
        primary_email: typeof dataToSend.primary_email,
        backup_email: typeof dataToSend.backup_email
      });
      
      const response = await setAdminInformation(
        adminInfo.full_name,
        adminInfo.primary_email,
        adminInfo.backup_email || '' // Send empty string if backup email is empty
      );
      
      console.log('Save response:', response);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Save response data:', responseData);
        setOriginalAdminInfo({ ...adminInfo });
        setShowSaveConfirmation(false);
        showSuccess('Profile information updated successfully!');
      } else {
        const errorData = await response.text();
        console.error('Save failed:', response.status, errorData);
        setError('Failed to save admin information');
      }
    } catch (error) {
      console.error('Error saving admin information:', error);
      setError('Failed to save admin information');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSave = () => {
    setShowSaveConfirmation(false);
    setAdminInfo({ ...originalAdminInfo });
  };

  // Username change functions
  const handleUsernameChange = (field, value) => {
    setUsernameChangeData(prev => ({
      ...prev,
      [field]: value
    }));
    setUsernameError('');
  };

  const handleChangeUsername = async () => {
    if (!usernameChangeData.new_username.trim()) {
      setUsernameError('Please enter a new username');
      return;
    }
    if (!usernameChangeData.current_password.trim()) {
      setUsernameError('Please enter your current password');
      return;
    }

    // Check if new username is the same as current username
    if (usernameChangeData.new_username.trim().toLowerCase() === currentUsername.toLowerCase()) {
      setUsernameError('New username cannot be the same as your current username');
      return;
    }

    // Show confirmation popup
    setShowUsernameConfirmation(true);
  };

  const confirmUsernameChange = async () => {
    setIsChangingUsername(true);
    setUsernameError('');
    
    try {
      const response = await changeAdminUsername(
        usernameChangeData.new_username,
        usernameChangeData.current_password
      );
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Username change success:', responseData);
        setCurrentUsername(usernameChangeData.new_username);
        setUsernameChangeData({ new_username: '', current_password: '' });
        setShowUsernamePassword(false);
        setShowUsernameConfirmation(false);
        showSuccess('Username changed successfully!');
      } else {
        const errorData = await response.text();
        console.error('Username change failed:', response.status, errorData);
        setUsernameError('Failed to change username. Please check your password.');
      }
    } catch (error) {
      console.error('Error changing username:', error);
      setUsernameError('Failed to change username. Please try again.');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const cancelUsernameChange = () => {
    setShowUsernameConfirmation(false);
  };


  // Password change functions
  const handlePasswordChange = (field, value) => {
    setPasswordChangeData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    if (!passwordChangeData.current_password.trim()) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!passwordChangeData.new_password.trim()) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (passwordChangeData.new_password !== passwordChangeData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordChangeData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    // Check if password contains both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(passwordChangeData.new_password);
    const hasNumber = /[0-9]/.test(passwordChangeData.new_password);
    if (!hasLetter || !hasNumber) {
      setPasswordError('New password must contain both letters and numbers');
      return;
    }

    // Check if new password is the same as current password
    if (passwordChangeData.new_password === passwordChangeData.current_password) {
      setPasswordError('New password cannot be the same as your current password');
      return;
    }

    // Show confirmation popup
    setShowPasswordConfirmation(true);
  };

  const confirmPasswordChange = async () => {
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      const response = await changeAdminPassword(
        passwordChangeData.current_password,
        passwordChangeData.new_password
      );
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Password change success:', responseData);
        setPasswordChangeData({ current_password: '', new_password: '', confirm_password: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setShowPasswordConfirmation(false);
        showSuccess('Password changed successfully!');
      } else {
        const errorData = await response.text();
        console.error('Password change failed:', response.status, errorData);
        setPasswordError('Failed to change password. Please check your current password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setShowPasswordConfirmation(false);
  };

  // Forgot password functions
  const handleForgotPasswordEmailChange = (value) => {
    setForgotPasswordEmail(value);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleSendOtp = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    
    try {
      console.log('=== OTP SEND DEBUG START ===');
      console.log('Sending OTP to:', forgotPasswordEmail);
      console.log('Email validation:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail));
      
      const response = await sendOtp(forgotPasswordEmail);
      
      console.log('OTP Response status:', response.status);
      console.log('OTP Response ok:', response.ok);
      console.log('OTP Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('OTP Response data:', responseData);
        console.log('=== OTP SEND SUCCESS ===');
        setForgotPasswordSuccess('OTP sent successfully! Please check your email for the 6-character verification code.');
        setForgotPasswordEmail('');
      } else {
        const errorData = await response.text();
        console.error('=== OTP SEND FAILED ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Data:', errorData);
        
        if (response.status === 400) {
          setForgotPasswordError('Invalid email address or email not found in our system.');
        } else if (response.status === 500) {
          setForgotPasswordError('Server error. Please try again later.');
        } else {
          setForgotPasswordError(`Failed to send OTP. Status: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('=== OTP SEND NETWORK ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      setForgotPasswordError(`Network error: ${error.message}`);
    } finally {
      setIsSendingOtp(false);
      console.log('=== OTP SEND DEBUG END ===');
    }
  };

  // Reset forgot password state function
  const resetForgotPasswordState = () => {
    setForgotPasswordEmail('');
    setIsSendingOtp(false);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  // Test function for debugging - can be called from browser console
  window.testOtpApi = async (email) => {
    console.log('=== MANUAL API TEST ===');
    console.log('Testing with email:', email);
    
    try {
      const response = await fetch('https://api-qcusolarcharge.up.railway.app/admin/sentOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      console.log('Test Response Status:', response.status);
      console.log('Test Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test Response Data:', data);
        console.log('✅ API TEST SUCCESS');
      } else {
        const errorText = await response.text();
        console.log('Test Error Response:', errorText);
        console.log('❌ API TEST FAILED');
      }
    } catch (error) {
      console.error('Test Network Error:', error);
      console.log('❌ API TEST NETWORK ERROR');
    }
  };

  if (!isOpen) return null;

  const renderAccountSettings = () => (
    <div className="settings-content">
      {isLoading ? (
        <div className="loading-container" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading admin information...</p>
        </div>
      ) : (
        <>
      <div className="settings-section" style={{
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className="section-title" style={{
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>Profile Information</h3>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Full Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter your full name"
            value={adminInfo.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            style={{
              backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Primary Email</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="admin@qcu.edu.ph"
            value={adminInfo.primary_email}
            onChange={(e) => handleInputChange('primary_email', e.target.value)}
            style={{
              backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Backup Email</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="backup@qcu.edu.ph"
            value={adminInfo.backup_email}
            onChange={(e) => handleInputChange('backup_email', e.target.value)}
            style={{
              backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}
          />
          <p className="form-help" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Used for account recovery and important notifications</p>
        </div>
            <div className="form-actions" style={{
              borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
            }}>
              {error && (
                <div className="error-message" style={{
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                  color: isDarkMode ? '#fca5a5' : '#dc2626'
                }}>
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={!hasChanges() || isLoading || isSaving}
                style={{
                  backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '500'
                }}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
        </div>
      </div>
        </>
      )}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-content">
      <div className="settings-section" style={{
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className="section-title" style={{
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>Username Management</h3>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>New Username</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter new username"
            value={usernameChangeData.new_username}
            onChange={(e) => handleUsernameChange('new_username', e.target.value)}
            disabled={isChangingUsername}
            style={{
              backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Current Password</label>
          <div className="password-input-group">
            <input 
              type={showUsernamePassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Enter current password"
              value={usernameChangeData.current_password}
              onChange={(e) => handleUsernameChange('current_password', e.target.value)}
              disabled={isChangingUsername}
              style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                color: isDarkMode ? '#ffffff' : '#1f2937'
              }}
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowUsernamePassword(!showUsernamePassword)}
              disabled={isChangingUsername}
              style={{
                color: isDarkMode ? '#6b7280' : '#1f2937'
              }}
            >
              {showUsernamePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {usernameError && (
          <div className="error-message" style={{
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
            color: isDarkMode ? '#fca5a5' : '#dc2626'
          }}>
            <AlertCircle className="w-4 h-4" />
            {usernameError}
          </div>
        )}
        <button 
          className="btn-primary" 
          onClick={handleChangeUsername}
          disabled={isChangingUsername || !usernameChangeData.new_username.trim() || !usernameChangeData.current_password.trim()}
          style={{
            backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
            color: '#ffffff',
            border: 'none',
            fontWeight: '500'
          }}
        >
          {isChangingUsername ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          Change Username
        </button>
      </div>

      <div className="settings-section" style={{
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className="section-title" style={{
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>Password & Authentication</h3>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Current Password</label>
          <div className="password-input-group">
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Enter current password"
              value={passwordChangeData.current_password}
              onChange={(e) => handlePasswordChange('current_password', e.target.value)}
              disabled={isChangingPassword}
              style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                color: isDarkMode ? '#ffffff' : '#1f2937'
              }}
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isChangingPassword}
              style={{
                color: isDarkMode ? '#6b7280' : '#1f2937'
              }}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>New Password</label>
          <div className="password-input-group">
            <input 
              type={showNewPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Enter new password"
              value={passwordChangeData.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              disabled={isChangingPassword}
              style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                color: isDarkMode ? '#ffffff' : '#1f2937'
              }}
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isChangingPassword}
              style={{
                color: isDarkMode ? '#6b7280' : '#1f2937'
              }}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Confirm New Password</label>
          <div className="password-input-group">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              className="form-input" 
              placeholder="Confirm new password"
              value={passwordChangeData.confirm_password}
              onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
              disabled={isChangingPassword}
              style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                color: isDarkMode ? '#ffffff' : '#1f2937'
              }}
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isChangingPassword}
              style={{
                color: isDarkMode ? '#6b7280' : '#1f2937'
              }}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {passwordError && (
          <div className="error-message" style={{
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
            color: isDarkMode ? '#fca5a5' : '#dc2626'
          }}>
            <AlertCircle className="w-4 h-4" />
            {passwordError}
          </div>
        )}
        <button 
          className="btn-primary" 
          onClick={handleChangePassword}
          disabled={isChangingPassword || !passwordChangeData.current_password.trim() || !passwordChangeData.new_password.trim() || !passwordChangeData.confirm_password.trim()}
          style={{
            backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
            color: '#ffffff',
            border: 'none',
            fontWeight: '500'
          }}
        >
          {isChangingPassword ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
          <Key className="w-4 h-4" />
          )}
          Change Password
        </button>
      </div>

      <div className="settings-section" style={{
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className="section-title" style={{
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>Forgot Password</h3>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="Enter your registered email address"
            value={forgotPasswordEmail}
            onChange={(e) => handleForgotPasswordEmailChange(e.target.value)}
            disabled={isSendingOtp}
            style={{
              backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              color: isDarkMode ? '#ffffff' : '#1f2937'
            }}
          />
          <p className="form-help" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Enter the email address associated with your admin account to receive a password reset code.</p>
        </div>
        {forgotPasswordError && (
          <div className="error-message" style={{
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
            color: isDarkMode ? '#fca5a5' : '#dc2626'
          }}>
            <AlertCircle className="w-4 h-4" />
            {forgotPasswordError}
          </div>
        )}
        {forgotPasswordSuccess && (
          <div className="success-message" style={{
            backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: isDarkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '2px solid rgba(34, 197, 94, 0.3)',
            color: isDarkMode ? '#86efac' : '#16a34a'
          }}>
            <UserCheck className="w-4 h-4" />
            {forgotPasswordSuccess}
          </div>
        )}
        <button 
          className="btn-primary" 
          onClick={handleSendOtp}
          disabled={isSendingOtp || !forgotPasswordEmail.trim()}
          style={{
            backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
            color: '#ffffff',
            border: 'none',
            fontWeight: '500'
          }}
        >
          {isSendingOtp ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Send Reset Code
        </button>
      </div>

      <div className="settings-section" style={{
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 className="section-title" style={{
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>Session Management</h3>
        <div className="form-group">
          <label className="form-label" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Session Timeout</label>
          <select className="form-select" style={{
            backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            color: isDarkMode ? '#ffffff' : '#1f2937'
          }}>
            <option value="15">15 minutes</option>
            <option value="30" selected>30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <button className="btn-secondary" style={{
          backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
          color: isDarkMode ? '#9aa3b2' : '#1f2937',
          border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
          fontWeight: '500'
        }}>
          <AlertCircle className="w-4 h-4" />
          Sign Out All Devices
        </button>
      </div>
    </div>
  );



  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderAccountSettings();
    }
  };

  return (
    <div className={`admin-settings-modal-overlay ${isDarkMode ? '' : 'light'}`} onClick={onClose} style={{
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className={`admin-settings-modal ${isDarkMode ? '' : 'light'}`} onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
        border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
        boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="modal-header" style={{
          backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
          borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>
          <h2 className="modal-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Admin Settings</h2>
          <button className="close-button" onClick={onClose} style={{
            color: isDarkMode ? '#9aa3b2' : '#1f2937',
            backgroundColor: 'transparent',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
            e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
          }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          <div className="settings-sidebar" style={{
            backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
            borderRight: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
          }}>
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    color: activeTab === tab.id 
                      ? (isDarkMode ? '#22c55e' : '#16a34a')
                      : (isDarkMode ? '#9aa3b2' : '#1f2937'),
                    backgroundColor: activeTab === tab.id 
                      ? (isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)')
                      : 'transparent',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
                      e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
                    }
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff'
          }}>
            {renderContent()}
          </div>
        </div>

        <div className="modal-footer" style={{
          backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
          borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
        }}>
          <div className="footer-spacer"></div>
        </div>

        {/* Save Confirmation Modal */}
        {showSaveConfirmation && (
          <div className="confirmation-overlay" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="confirmation-modal" style={{
              backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="confirmation-header" style={{
                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <h3 style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Save Changes</h3>
                <button 
                  className="close-button" 
                  onClick={cancelSave}
                  disabled={isSaving}
                  style={{
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    backgroundColor: 'transparent',
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
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="confirmation-content">
                <p style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Are you sure you want to save these changes to your admin information?</p>
                {error && (
                  <div className="error-message" style={{
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                    color: isDarkMode ? '#fca5a5' : '#dc2626'
                  }}>
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
              <div className="confirmation-footer" style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
                borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <button 
                  className="btn-secondary" 
                  onClick={cancelSave}
                  disabled={isSaving}
                  style={{
                    backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                    fontWeight: '500'
                  }}
                >
            Cancel
          </button>
                <button 
                  className="btn-primary" 
                  onClick={confirmSave}
                  disabled={isSaving}
                  style={{
                    backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '500'
                  }}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
            <Save className="w-4 h-4" />
                  )}
            Save Changes
          </button>
        </div>
            </div>
          </div>
        )}

        {/* Username Change Confirmation Modal */}
        {showUsernameConfirmation && (
          <div className="confirmation-overlay" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="confirmation-modal" style={{
              backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="confirmation-header" style={{
                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <h3 style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Change Username</h3>
                <button 
                  className="close-button" 
                  onClick={cancelUsernameChange}
                  disabled={isChangingUsername}
                  style={{
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    backgroundColor: 'transparent',
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
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="confirmation-content">
                <p style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Are you sure you want to change your username to "{usernameChangeData.new_username}"?</p>
                <p className="confirmation-note" style={{color: isDarkMode ? '#6b7280' : '#1f2937'}}>This will validate your current password.</p>
                {usernameError && (
                  <div className="error-message" style={{
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                    color: isDarkMode ? '#fca5a5' : '#dc2626'
                  }}>
                    <AlertCircle className="w-4 h-4" />
                    {usernameError}
                  </div>
                )}
              </div>
              <div className="confirmation-footer" style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
                borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <button 
                  className="btn-secondary" 
                  onClick={cancelUsernameChange}
                  disabled={isChangingUsername}
                  style={{
                    backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={confirmUsernameChange}
                  disabled={isChangingUsername}
                  style={{
                    backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '500'
                  }}
                >
                  {isChangingUsername ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  Change Username
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Confirmation Modal */}
        {showPasswordConfirmation && (
          <div className="confirmation-overlay" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="confirmation-modal" style={{
              backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="confirmation-header" style={{
                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <h3 style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Change Password</h3>
                <button 
                  className="close-button" 
                  onClick={cancelPasswordChange}
                  disabled={isChangingPassword}
                  style={{
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    backgroundColor: 'transparent',
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
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="confirmation-content">
                <p style={{color: isDarkMode ? '#9aa3b2' : '#1f2937'}}>Are you sure you want to change your password?</p>
                <p className="confirmation-note" style={{color: isDarkMode ? '#6b7280' : '#1f2937'}}>This will validate your current password.</p>
                {passwordError && (
                  <div className="error-message" style={{
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                    color: isDarkMode ? '#fca5a5' : '#dc2626'
                  }}>
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}
              </div>
              <div className="confirmation-footer" style={{
                backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
                borderTop: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
              }}>
                <button 
                  className="btn-secondary" 
                  onClick={cancelPasswordChange}
                  disabled={isChangingPassword}
                  style={{
                    backgroundColor: isDarkMode ? '#1e2633' : '#f3f4f6',
                    color: isDarkMode ? '#9aa3b2' : '#1f2937',
                    border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={confirmPasswordChange}
                  disabled={isChangingPassword}
                  style={{
                    backgroundColor: isDarkMode ? '#22c55e' : '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '500'
                  }}
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsModal;
