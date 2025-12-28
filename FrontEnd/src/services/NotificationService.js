/**
 * NOTIFICATION SERVICE
 * ====================
 * Handles browser/system notifications for vaccine reminders
 * Uses the Notification API to send push notifications to device
 */

export class NotificationService {
  /**
   * Check if browser supports notifications
   */
  static isSupported() {
    return 'Notification' in window;
  }

  /**
   * Check current notification permission status
   */
  static getPermission() {
    if (!this.isSupported()) return null;
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission() {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('User has denied notification permissions');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Send a notification
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   */
  static async sendNotification(title, options = {}) {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return null;
    }

    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    const defaultOptions = {
      icon: '/vite.svg', // App icon
      badge: '/vite.svg',
      tag: 'vaccine-reminder', // Prevent duplicate notifications
      requireInteraction: true, // Don't auto-close
      vibrate: [200, 100, 200], // Vibration pattern
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Send vaccine reminder notification
   * @param {array} vaccines - Array of vaccines due within 7 days
   */
  static async sendVaccineReminders(vaccines) {
    if (!vaccines || vaccines.length === 0) return;

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    // Send notification for each vaccine or single notification for multiple
    if (vaccines.length === 1) {
      const vaccine = vaccines[0];
      const daysLeft = this.calculateDaysRemaining(vaccine.dueDate);
      await this.sendNotification(
        `💉 ${vaccine.name} - URGENT REMINDER`,
        {
          body: `Due in ${daysLeft} days for ${vaccine.forPerson}. Please schedule your appointment.`,
          tag: `vaccine-${vaccine.id}`,
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      );
    } else {
      const dueCount = vaccines.length;
      const vaccineNames = vaccines.slice(0, 2).map(v => v.name).join(', ');
      const moreText = dueCount > 2 ? ` and ${dueCount - 2} more` : '';
      
      await this.sendNotification(
        `🔔 ${dueCount} Vaccine Reminders - URGENT`,
        {
          body: `${vaccineNames}${moreText} are due within 7 days. Please check your schedule.`,
          tag: 'vaccine-batch',
          actions: [
            { action: 'view', title: 'View All' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        }
      );
    }
  }

  /**
   * Calculate days remaining until vaccine due date
   * @param {string} dateString - Due date string
   * @returns {number} Days remaining
   */
  static calculateDaysRemaining(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return Math.max(daysRemaining, 0);
  }

  /**
   * Check if vaccine is due within 7 days
   * @param {string} dateString - Due date string
   * @returns {boolean}
   */
  static isDueWithinWeek(dateString) {
    const daysRemaining = this.calculateDaysRemaining(dateString);
    return daysRemaining > 0 && daysRemaining <= 7;
  }

  /**
   * Initialize notifications on app load
   * Request permission and set up notification checking
   */
  static async initialize() {
    if (!this.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    // Only request if not already granted or denied
    if (Notification.permission === 'default') {
      await this.requestPermission();
    }

    return Notification.permission === 'granted';
  }
}

export default NotificationService;
