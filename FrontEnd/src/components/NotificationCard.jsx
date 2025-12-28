/**
 * NOTIFICATION COMPONENT
 * ======================
 * Displays notifications for upcoming vaccines
 * Alerts user 1 week before vaccine is due
 */

export default function NotificationCard({ 
  vaccinesData = [],
  onDismiss = () => {}
}) {
  // Calculate if vaccine is due within 7 days
  const getUpcomingVaccines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return vaccinesData.filter(vaccine => {
      if (vaccine.status === 'taken') return false; // Skip taken vaccines
      
      const dueDate = new Date(vaccine.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  };

  const upcomingVaccines = getUpcomingVaccines();

  if (upcomingVaccines.length === 0) {
    return null; // Don't show if no upcoming vaccines
  }

  // Calculate days remaining for first vaccine
  const getDay = (vaccine) => {
    const today = new Date();
    const dueDate = new Date(vaccine.dueDate);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining;
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <span className="notification-icon">🔔</span>
        <span className="notification-title">Upcoming Vaccines</span>
        <button 
          className="notification-close"
          onClick={onDismiss}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      <div className="notification-content">
        {upcomingVaccines.map((vaccine, index) => (
          <div key={vaccine.id} className="notification-item">
            <div className="notification-item-header">
              <span className="notification-vaccine-name">{vaccine.name}</span>
              <span className="notification-days-badge">
                {getDay(vaccine)} days left
              </span>
            </div>
            <div className="notification-item-details">
              <span className="notification-detail">
                👤 {vaccine.forPerson}
              </span>
              <span className="notification-detail">
                📅 {vaccine.dueDate}
              </span>
            </div>
            {index < upcomingVaccines.length - 1 && (
              <div className="notification-divider"></div>
            )}
          </div>
        ))}
      </div>

      <div className="notification-footer">
        <p className="notification-message">
          ⚠️ These vaccines are due within 7 days
        </p>
      </div>
    </div>
  );
}
