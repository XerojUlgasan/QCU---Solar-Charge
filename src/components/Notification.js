import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import '../styles/Notification.css';

const Notification = ({ notification, index, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Match CSS transition duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="notification-icon" />;
      case 'error':
        return <XCircle className="notification-icon" />;
      case 'warning':
        return <AlertTriangle className="notification-icon" />;
      case 'info':
      default:
        return <Info className="notification-icon" />;
    }
  };

  const getTypeClass = () => {
    return `notification notification-${notification.type}`;
  };

  return (
    <div
      className={`${getTypeClass()} ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
      style={{
        '--index': index,
        transform: `translateX(${isVisible ? '0' : '100%'})`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="notification-content">
        <div className="notification-icon-container">
          {getIcon()}
        </div>
        <div className="notification-body">
          <div className="notification-message">
            {notification.message}
          </div>
          {notification.description && (
            <div className="notification-description">
              {notification.description}
            </div>
          )}
        </div>
        <button
          className="notification-close"
          onClick={handleRemove}
          aria-label="Close notification"
        >
          <X className="close-icon" />
        </button>
      </div>
      {notification.duration > 0 && (
        <div className="notification-progress">
          <div 
            className="notification-progress-bar"
            style={{
              animationDuration: `${notification.duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Notification;
