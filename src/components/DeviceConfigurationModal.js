import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Clock, 
  Zap, 
  Thermometer, 
  AlertTriangle, 
  Mail, 
  Power, 
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { authenticatedGet, authenticatedPost } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import '../styles/DeviceConfigurationModal.css';

const DeviceConfigurationModal = ({ 
  isOpen, 
  onClose, 
  device, 
  onSave, 
  onEnableDisable, 
  onDelete 
}) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    minutesPerCoinRate: '',
    samplesPerHourRate: '',
    lowPowerMode: false,
    temperatureThreshold: '',
    minVoltage: '',
    maxVoltage: '',
    enableDeviceAlerts: false,
    emailsToNotify: ''
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceEnabled, setDeviceEnabled] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [lastFetchedDeviceId, setLastFetchedDeviceId] = useState(null);
  const [emailValidationError, setEmailValidationError] = useState('');

  // Email validation function
  const validateEmails = (emailString) => {
    if (!emailString || emailString.trim() === '') {
      return { isValid: true, error: '' }; // Empty is valid
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return { 
          isValid: false, 
          error: `Invalid email format: "${email}". Please use format: user@domain.com` 
        };
      }
    }
    
    return { isValid: true, error: '' };
  };

  // Set default configuration when no config exists
  const setDefaultConfiguration = () => {
    const defaultFormData = {
      minutesPerCoinRate: '5',
      samplesPerHourRate: '60',
      lowPowerMode: false,
      temperatureThreshold: '35',
      minVoltage: '12.06',
      maxVoltage: '12.7',
      enableDeviceAlerts: true,
      emailsToNotify: ''
    };

    setFormData(defaultFormData);
    setOriginalFormData({
      ...defaultFormData,
      deviceEnabled: device?.isEnabled || true
    });
    setDeviceEnabled(device?.isEnabled || true);
    
    console.log('Default configuration set for device:', device?.id);
  };

  // Fetch device configuration from API
  const fetchDeviceConfiguration = async (deviceId) => {
    console.log('fetchDeviceConfiguration called for device:', deviceId);
    if (!deviceId) return;
    
    // Clear any previous data to prevent showing wrong device data
    setFormData({
      minutesPerCoinRate: '',
      samplesPerHourRate: '',
      lowPowerMode: false,
      temperatureThreshold: '',
      minVoltage: '',
      maxVoltage: '',
      enableDeviceAlerts: false,
      emailsToNotify: ''
    });
    setError(null);
    setIsLoading(true);
    
    try {
      const url = `https://api-qcusolarcharge.up.railway.app/admin/getDeviceConfig?device_id=${deviceId}&t=${Date.now()}`;
      console.log('Making API request to:', url);
      const response = await authenticatedGet(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch device configuration: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has content before parsing JSON
      const responseText = await response.text();
      console.log('Raw API response for device', deviceId, ':', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('Empty response detected for device', deviceId, ', using default configuration');
        setDefaultConfiguration();
        return;
      }
      
      let configData;
      try {
        configData = JSON.parse(responseText);
      } catch (parseError) {
        console.log('JSON parsing error for device', deviceId, ', using default configuration:', parseError.message);
        setDefaultConfiguration();
        return;
      }
      
      console.log('Parsed config data for device', deviceId, ':', configData);
      
      // Verify the response is for the correct device
      if (configData.device_id && configData.device_id !== deviceId) {
        console.log('Device ID mismatch! Expected:', deviceId, 'Got:', configData.device_id);
        console.log('Using default configuration instead');
        setDefaultConfiguration();
        return;
      }
      
      // Handle empty or invalid response object
      if (!configData || Object.keys(configData).length === 0) {
        console.log('No configuration data found for device', deviceId, ', using defaults');
        setDefaultConfiguration();
        return;
      }
      
      // Convert emails array to string for form display
      const emailsString = Array.isArray(configData.emails) 
        ? configData.emails.join(', ')
        : (configData.emails || '');

      // Map API response to form data based on actual API field names
      const newFormData = {
        minutesPerCoinRate: configData.minute_per_peso || '',
        samplesPerHourRate: configData.samples_per_hour || '',
        lowPowerMode: configData.low_power || false,
        temperatureThreshold: configData.max_temp || '',
        minVoltage: configData.min_volt || '',
        maxVoltage: configData.max_volt || '',
        enableDeviceAlerts: configData.device_alert_enabled || false,
        emailsToNotify: emailsString
      };

      setFormData(newFormData);
      setOriginalFormData({
        ...newFormData,
        deviceEnabled: configData.device_enabled || false
      });

      // Update device enabled status from API response
      if (configData.device_enabled !== undefined) {
        setDeviceEnabled(configData.device_enabled);
      }
      
    } catch (err) {
      console.error('Error fetching device configuration:', err);
      
      // Check if it's a JSON parsing error (empty response)
      if (err.message.includes('Unexpected end of JSON input') || err.message.includes('JSON')) {
        console.log('JSON parsing error detected, using default configuration');
        setDefaultConfiguration();
        return;
      }
      
      setError(err.message);
      
      // Show error notification
      showError('Failed to load device configuration');
      
      // Fallback to device props if API fails
      if (device) {
        setFormData({
          minutesPerCoinRate: device.minutesPerCoinRate || '',
          samplesPerHourRate: device.samplesPerHourRate || '',
          lowPowerMode: device.lowPowerMode || false,
          temperatureThreshold: device.temperatureThreshold || '',
          minVoltage: device.minVoltage || '',
          maxVoltage: device.maxVoltage || '',
          enableDeviceAlerts: device.enableDeviceAlerts || false,
          emailsToNotify: device.emailsToNotify || ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form data when device changes
  useEffect(() => {
    console.log('DeviceConfigurationModal useEffect triggered:', { 
      deviceId: device?.id, 
      isOpen, 
      lastFetchedDeviceId 
    });
    
    if (device?.id && isOpen && device.id !== lastFetchedDeviceId) {
      console.log('Fetching configuration for device:', device.id);
      setLastFetchedDeviceId(device.id);
      fetchDeviceConfiguration(device.id);
      setDeviceEnabled(device.isEnabled || false);
    }
  }, [device?.id, isOpen, lastFetchedDeviceId]); // Only depend on device ID, not the entire device object

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Check if there are unsaved changes
  const checkForUnsavedChanges = () => {
    if (!originalFormData) return false;
    
    // Check form data changes
    const formChanged = Object.keys(formData).some(key => 
      formData[key] !== originalFormData[key]
    );
    
    // Check device enabled state change
    const deviceEnabledChanged = deviceEnabled !== (originalFormData.deviceEnabled || false);
    
    return formChanged || deviceEnabledChanged;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(device.id, formData);
    }
    onClose();
  };

  const handleEnableDisable = () => {
    setDeviceEnabled(!deviceEnabled);
    setHasUnsavedChanges(true);
    
    // Show immediate feedback notification
    const newState = !deviceEnabled;
    showSuccess(
      `Device ${newState ? 'enabled' : 'disabled'} successfully!`
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
    setDeleteConfirmationText('');
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmationText === device.id) {
      setIsDeleting(true);
      if (onDelete) {
        onDelete(device.id);
      }
      
      // Show success notification
      showSuccess('Device deleted successfully!');
      
      setTimeout(() => {
        setIsDeleting(false);
        setShowDeleteConfirmation(false);
        onClose();
      }, 1000);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationText('');
  };

  const handleSaveConfigurations = () => {
    // Validate emails before showing save confirmation
    const emailValidation = validateEmails(formData.emailsToNotify);
    if (!emailValidation.isValid) {
      setEmailValidationError(emailValidation.error);
      showError(emailValidation.error);
      return; // Don't show save confirmation modal
    }
    
    // Clear any previous email validation errors
    setEmailValidationError('');
    setShowSaveConfirmation(true);
  };

  const handleSaveConfirm = async () => {
    setIsSaving(true);
    try {
      await saveDeviceConfiguration(device.id, formData);
      
      // Update originalFormData to reflect the saved state
      setOriginalFormData({
        ...formData,
        deviceEnabled: deviceEnabled
      });
      
      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Show success notification
      showSuccess('Device configuration saved successfully!');
      
      // Close modal after successful save
      setTimeout(() => {
        setIsSaving(false);
        setShowSaveConfirmation(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save configuration:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        formData: formData,
        deviceId: device.id
      });
      setIsSaving(false);
      setShowSaveConfirmation(false);
      
      // Show error notification
      const errorMessage = err.message || 'Unknown error occurred';
      showError(`Failed to save configuration: ${errorMessage}`);
    }
  };

  const handleSaveCancel = () => {
    setShowSaveConfirmation(false);
  };

  const handleRetry = () => {
    if (device && device.id) {
      fetchDeviceConfiguration(device.id);
    }
  };

  const handleClose = () => {
    if (checkForUnsavedChanges()) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCloseConfirm = () => {
    // Reset form data to original state
    setFormData({
      minutesPerCoinRate: originalFormData.minutesPerCoinRate || '',
      samplesPerHourRate: originalFormData.samplesPerHourRate || '',
      lowPowerMode: originalFormData.lowPowerMode || false,
      temperatureThreshold: originalFormData.temperatureThreshold || '',
      minVoltage: originalFormData.minVoltage || '',
      maxVoltage: originalFormData.maxVoltage || '',
      enableDeviceAlerts: originalFormData.enableDeviceAlerts || false,
      emailsToNotify: originalFormData.emailsToNotify || ''
    });
    
    // Reset device enabled state to original
    setDeviceEnabled(originalFormData.deviceEnabled || true);
    
    // Clear unsaved changes flag
    setHasUnsavedChanges(false);
    
    // Clear any email validation errors
    setEmailValidationError('');
    
    setShowCloseConfirmation(false);
    onClose();
  };

  const handleCloseCancel = () => {
    setShowCloseConfirmation(false);
  };

  // Save device configuration to API
  const saveDeviceConfiguration = async (deviceId, formData) => {
    try {
      // Validate required fields
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      console.log('Form data received:', formData);

      // Convert emails to string format for API
      let emailsString = '';
      if (formData.emailsToNotify) {
        if (typeof formData.emailsToNotify === 'string') {
          // If it's already a string, clean it up
          emailsString = formData.emailsToNotify.split(',').map(email => email.trim()).filter(email => email).join(', ');
        } else if (Array.isArray(formData.emailsToNotify)) {
          // If it's an array, join with commas
          emailsString = formData.emailsToNotify.filter(email => email && email.trim()).join(', ');
        }
      }
      
      console.log('Emails processing:', {
        original: formData.emailsToNotify,
        type: typeof formData.emailsToNotify,
        isArray: Array.isArray(formData.emailsToNotify),
        processed: emailsString,
        length: emailsString.split(',').length
      });

      // Map form data to API request format
      const requestData = {
        device_id: deviceId,
        device_alert_enabled: formData.enableDeviceAlerts,
        device_enabled: deviceEnabled,
        emails: emailsString,
        low_power: formData.lowPowerMode,
        max_batt: 100, // Default value, can be made configurable later
        max_temp: parseFloat(formData.temperatureThreshold) || 35,
        max_volt: parseFloat(formData.maxVoltage) || 12.7,
        min_batt: 50, // Default value, can be made configurable later
        min_temp: 25, // Default value, can be made configurable later
        min_volt: parseFloat(formData.minVoltage) || 12.06,
        minute_per_peso: parseFloat(formData.minutesPerCoinRate) || 5,
        samples_per_hour: parseFloat(formData.samplesPerHourRate) || 60,
        update_gap_seconds: 60 // Default value, can be made configurable later
      };

      console.log('Saving device configuration:', requestData);
      console.log('Email field in request:', {
        emails: requestData.emails,
        type: typeof requestData.emails,
        isArray: Array.isArray(requestData.emails),
        length: requestData.emails.split(',').length
      });

      const url = 'https://api-qcusolarcharge.up.railway.app/admin/setDeviceConfig';
      console.log('Making POST request to:', url);
      console.log('Request data:', requestData);
      
      const response = await authenticatedPost(url, requestData);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to save device configuration: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Save configuration result:', result);
      
      return result;
    } catch (err) {
      console.error('Error saving device configuration:', err);
      throw err;
    }
  };

  if (!isOpen || !device) {
    console.log('Modal not rendering:', { isOpen, device: !!device });
    return null;
  }

  return (
    <div className="device-config-overlay">
      <div className="device-config-modal">
        {/* Header */}
        <div className="device-config-header">
          <div className="device-config-title-section">
            <Settings className="device-config-icon" />
            <div>
              <h2 className="device-config-title">Device Configuration</h2>
              <p className="device-config-subtitle">
                Configure settings for {device.name} ({device.id})
              </p>
            </div>
          </div>
          <div className="device-config-header-actions">
            <button 
              className="device-config-save"
              onClick={handleSaveConfigurations}
              title="Save Configuration"
            >
              Save
            </button>
            <button 
              className="device-config-close"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="device-config-content">
          {/* Loading State */}
          {isLoading && (
            <div className="config-loading">
              <Loader2 className="loading-spinner" />
              <p className="loading-text">Loading device configuration...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="config-error">
              <AlertTriangle className="error-icon" />
              <div className="error-content">
                <h4 className="error-title">Failed to Load Configuration</h4>
                <p className="error-message">{error}</p>
                <button className="retry-button" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Configuration Settings */}
          {!isLoading && !error && (
            <>
            <div className="config-section">
            <h3 className="config-section-title">Device Settings</h3>
            
            <div className="config-grid">
              {/* Minutes per coin rate */}
              <div className="config-field">
                <label className="config-label">
                  <Clock className="config-field-icon clock-icon" />
                  Minutes per Coin Rate
                </label>
                <input
                  type="number"
                  value={formData.minutesPerCoinRate}
                  onChange={(e) => handleInputChange('minutesPerCoinRate', e.target.value)}
                  placeholder="e.g., 5"
                  className="config-input"
                />
                <span className="config-help">Minutes of charging per coin</span>
              </div>

              {/* Samples per hour rate */}
              <div className="config-field">
                <label className="config-label">
                  <Zap className="config-field-icon zap-icon" />
                  Samples per Hour Rate
                </label>
                <input
                  type="number"
                  value={formData.samplesPerHourRate}
                  onChange={(e) => handleInputChange('samplesPerHourRate', e.target.value)}
                  placeholder="e.g., 60"
                  className="config-input"
                />
                <span className="config-help">Higher = more accurate (1-3600)</span>
              </div>

              {/* Temperature threshold */}
              <div className="config-field">
                <label className="config-label">
                  <Thermometer className="config-field-icon thermometer-icon" />
                  Temperature Threshold
                </label>
                <input
                  type="number"
                  value={formData.temperatureThreshold}
                  onChange={(e) => handleInputChange('temperatureThreshold', e.target.value)}
                  placeholder="e.g., 45"
                  className="config-input"
                />
                <span className="config-help">Temperature limit in °C</span>
              </div>

              {/* Min/Max Voltage */}
              <div className="config-field">
                <label className="config-label">
                  <Zap className="config-field-icon voltage-icon" />
                  Min Voltage
                </label>
                <input
                  type="number"
                  value={formData.minVoltage}
                  onChange={(e) => handleInputChange('minVoltage', e.target.value)}
                  placeholder="e.g., 3.0"
                  className="config-input"
                />
                <span className="config-help">Minimum voltage in V</span>
              </div>

              <div className="config-field">
                <label className="config-label">
                  <Zap className="config-field-icon voltage-icon" />
                  Max Voltage
                </label>
                <input
                  type="number"
                  value={formData.maxVoltage}
                  onChange={(e) => handleInputChange('maxVoltage', e.target.value)}
                  placeholder="e.g., 5.0"
                  className="config-input"
                />
                <span className="config-help">Maximum voltage in V</span>
              </div>

              {/* Emails to notify */}
              <div className="config-field config-field-wide">
                <label className="config-label">
                  <Mail className="config-field-icon mail-icon" />
                  Emails to Notify
                </label>
                <input
                  type="text"
                  value={formData.emailsToNotify}
                  onChange={(e) => handleInputChange('emailsToNotify', e.target.value)}
                  placeholder="admin@example.com, tech@example.com"
                  className={`config-input ${emailValidationError ? 'config-input-error' : ''}`}
                />
                {emailValidationError ? (
                  <span className="config-error-text">{emailValidationError}</span>
                ) : (
                  <span className="config-help">Comma-separated email addresses</span>
                )}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="config-toggles">
              <div className="config-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.lowPowerMode}
                    onChange={(e) => handleInputChange('lowPowerMode', e.target.checked)}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-slider"></span>
                  <div className="toggle-content">
                    <Power className="toggle-icon power-icon" />
                    <div>
                      <span className="toggle-title">Low Power Mode</span>
                      <span className="toggle-description">Increases update latency</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="config-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.enableDeviceAlerts}
                    onChange={(e) => handleInputChange('enableDeviceAlerts', e.target.checked)}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-slider"></span>
                  <div className="toggle-content">
                    <AlertTriangle className="toggle-icon alert-icon" />
                    <div>
                      <span className="toggle-title">Enable Device Alerts</span>
                      <span className="toggle-description">Send notifications for device issues</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="config-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={deviceEnabled}
                    onChange={(e) => handleEnableDisable()}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-slider"></span>
                  <div className="toggle-content">
                    <Power className="toggle-icon power-icon" />
                    <div>
                      <span className="toggle-title">Device Enabled</span>
                      <span className="toggle-description">{deviceEnabled ? 'Device is currently active' : 'Device is currently disabled'}</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Device Management */}
          <div className="config-section">
            <h3 className="config-section-title">Device Management</h3>
            
            <div className="device-management-buttons">
              <button 
                className="management-button delete-button"
                onClick={handleDeleteClick}
              >
                <Trash2 className="button-icon" />
                Delete Device
              </button>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="device-config-footer">
          <button 
            className="config-button cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="config-button save-button"
            onClick={handleSave}
          >
            Save Configuration
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-modal">
              <div className="delete-confirmation-header">
                <AlertTriangle className="delete-warning-icon" />
                <h3 className="delete-confirmation-title">Delete Device</h3>
              </div>
              
              <div className="delete-confirmation-content">
                <p className="delete-warning-text">
                  This action cannot be undone. This will permanently delete the device and all its data.
                </p>
                <p className="delete-instruction-text">
                  To confirm deletion, type the device ID: <strong>{device.id}</strong>
                </p>
                
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={`Type "${device.id}" to confirm`}
                  className="delete-confirmation-input"
                />
              </div>
              
              <div className="delete-confirmation-footer">
                <button 
                  className="config-button cancel-button"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button 
                  className={`config-button delete-confirm-button ${deleteConfirmationText === device.id ? 'enabled' : 'disabled'}`}
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmationText !== device.id || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Device'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Confirmation Modal */}
        {showSaveConfirmation && (
          <div className="save-confirmation-overlay">
            <div className="save-confirmation-modal">
              <div className="save-confirmation-header">
                <CheckCircle className="save-confirmation-icon" />
                <h3 className="save-confirmation-title">Save Configuration</h3>
              </div>
              
              <div className="save-confirmation-content">
                <p className="save-confirmation-text">
                  Are you sure you want to save the configuration changes for <strong>{device.name}</strong>?
                </p>
                <p className="save-confirmation-warning">
                  This will update the device settings and may affect its operation.
                </p>
              </div>
              
              <div className="save-confirmation-footer">
                <button 
                  className="config-button cancel-button"
                  onClick={handleSaveCancel}
                >
                  Cancel
                </button>
                <button 
                  className="config-button save-confirm-button"
                  onClick={handleSaveConfirm}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Close Confirmation Modal */}
        {showCloseConfirmation && (
          <div className="close-confirmation-overlay">
            <div className="close-confirmation-modal">
              <div className="close-confirmation-header">
                <AlertTriangle className="close-warning-icon" />
                <h3 className="close-confirmation-title">Unsaved Changes</h3>
              </div>
              
              <div className="close-confirmation-content">
                <p className="close-warning-text">
                  You have unsaved changes. Are you sure you want to close without saving?
                </p>
                <p className="close-instruction-text">
                  Your changes will be lost if you close now.
                </p>
              </div>
              
              <div className="close-confirmation-footer">
                <button 
                  className="config-button cancel-button"
                  onClick={handleCloseCancel}
                >
                  Cancel
                </button>
                <button 
                  className="config-button close-confirm-button"
                  onClick={handleCloseConfirm}
                >
                  Close Without Saving
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceConfigurationModal;
