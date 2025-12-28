/**
 * NOTIFICATION PERMISSION BANNER COMPONENT
 * ========================================
 * Displays a banner requesting notification permissions
 * Only shows if permissions are not yet granted
 */

import { useState } from 'react';
import NotificationService from '../services/NotificationService';
import '../styles/NotificationBanner.css';

export default function NotificationBanner({ onPermissionChange = () => {} }) {
  const [isVisible, setIsVisible] = useState(
    NotificationService.isSupported() && 
    NotificationService.getPermission() === 'default'
  );

  const handleEnable = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setIsVisible(false);
      onPermissionChange(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !NotificationService.isSupported()) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner-content">
        <div className="notification-banner-icon">🔔</div>
        <div className="notification-banner-text">
          <p className="notification-banner-title">Enable Notifications</p>
          <p className="notification-banner-message">
            Get reminders for upcoming vaccine appointments
          </p>
        </div>
      </div>
      <div className="notification-banner-actions">
        <button 
          className="notification-banner-btn enable"
          onClick={handleEnable}
        >
          Enable
        </button>
        <button 
          className="notification-banner-btn dismiss"
          onClick={handleDismiss}
        >
          Not Now
        </button>
      </div>
      <button 
        className="notification-banner-close"
        onClick={handleDismiss}
      >
        ✕
      </button>
    </div>
  );
}
