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
  XCircle
} from 'lucide-react';
import '../styles/DeviceConfigurationModal.css';

const DeviceConfigurationModal = ({ 
  isOpen, 
  onClose, 
  device, 
  onSave, 
  onEnableDisable, 
  onDelete 
}) => {
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

  // Initialize form data when device changes
  useEffect(() => {
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
  }, [device]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(device.id, formData);
    }
    onClose();
  };

  const handleEnableDisable = () => {
    if (onEnableDisable) {
      onEnableDisable(device.id, !device.isEnabled);
    }
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
    setShowSaveConfirmation(true);
  };

  const handleSaveConfirm = () => {
    setIsSaving(true);
    if (onSave) {
      onSave(device.id, formData);
    }
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveConfirmation(false);
      onClose();
    }, 1000);
  };

  const handleSaveCancel = () => {
    setShowSaveConfirmation(false);
  };

  if (!isOpen || !device) return null;

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
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="device-config-content">
          {/* Configuration Settings */}
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
                  className="config-input"
                />
                <span className="config-help">Comma-separated email addresses</span>
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
            </div>
          </div>

          {/* Device Management */}
          <div className="config-section">
            <h3 className="config-section-title">Device Management</h3>
            
            <div className="device-management-buttons">
              <button 
                className={`management-button ${device.isEnabled ? 'disable-button' : 'enable-button'}`}
                onClick={handleEnableDisable}
              >
                {device.isEnabled ? (
                  <>
                    <XCircle className="button-icon" />
                    Disable Device
                  </>
                ) : (
                  <>
                    <CheckCircle className="button-icon" />
                    Enable Device
                  </>
                )}
              </button>

              <button 
                className="management-button delete-button"
                onClick={handleDeleteClick}
              >
                <Trash2 className="button-icon" />
                Delete Device
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default DeviceConfigurationModal;
