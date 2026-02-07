/**
 * REMINDER CARD COMPONENT
 * =======================
 * Displays health reminders in a clean card layout
 * Shows reminders with icons and timestamps
 */

import { deleteReminder } from '../api';

export default function ReminderCard({ reminders = [], onReminderDeleted }) {
  // Only show actual reminders, no defaults
  const displayReminders = reminders;

  const handleDeleteReminder = async (reminderId, reminderTitle) => {
    if (!window.confirm(`Delete "${reminderTitle}" reminder?`)) {
      return;
    }

    try {
      await deleteReminder(reminderId);
      console.log('✅ Reminder deleted successfully');
      
      // Callback to refresh reminders list
      if (onReminderDeleted) {
        onReminderDeleted();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder. Please try again.');
    }
  };

  return (
    <div className="reminders-section">
      <div className="section-header">
        <h2>Upcoming Reminders</h2>
        <span className="reminder-badge">{displayReminders.length}</span>
      </div>

      <div className="reminders-list">
        {displayReminders.length > 0 ? (
          displayReminders.map((reminder) => (
            <div key={reminder.id} className="reminder-item">
              <div className="reminder-icon">{reminder.icon}</div>
              <div className="reminder-content">
                <h3>{reminder.title}</h3>
                <p>{reminder.formattedDate || reminder.description}</p>
              </div>

            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            <p>No upcoming reminders</p>
          </div>
        )}
      </div>
    </div>
  );
}
