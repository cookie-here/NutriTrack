/**
 * VACCINE CARD COMPONENT
 * ======================
 * Displays individual vaccine cards with status
 * Shows name, description, due date, and action buttons
 */

export default function VaccineCard({ 
  id = 1,
  name = "Vaccine Name",
  emoji = "💉",
  description = "Vaccine description",
  dueDate = "Dec 1, 2025",
  status = "upcoming", // taken, pending, upcoming
  forPerson = "Mother", // Mother, Baby
  details = "", // Additional details
  isDueWithinWeek = false, // Highlight if due within 7 days
  onMarkDone = () => {}
}) {
  return (
    <div className={`vaccine-card ${isDueWithinWeek && status !== 'taken' ? 'urgent' : ''}`}>
      <div className="vaccine-card-header">
        <div className="vaccine-card-icon">{emoji}</div>
        <div className="vaccine-card-title-section">
          <h3 className="vaccine-card-title">{name}</h3>
          <div className="vaccine-card-status-wrapper">
            <span className={`vaccine-card-status ${status}`}>
              {status === 'taken' && '✓ Taken'}
              {status === 'pending' && '⏱ Pending'}
              {status === 'upcoming' && '⏰ Upcoming'}
            </span>
            {isDueWithinWeek && status !== 'taken' && (
              <span className="vaccine-urgent-badge">⚠ URGENT</span>
            )}
          </div>
        </div>
      </div>

      <div className="vaccine-card-details">
        <div className="vaccine-detail-item">
          <span className="vaccine-detail-label">👤 {forPerson}</span>
          <span className="vaccine-detail-badge">{details}</span>
        </div>
        <div className="vaccine-detail-item">
          <span className="vaccine-detail-label">ℹ</span>
          <span className="vaccine-detail-value">{description}</span>
        </div>
        <div className="vaccine-detail-item">
          <span className="vaccine-detail-label">📅</span>
          <span className="vaccine-detail-value">Due: {dueDate}</span>
        </div>
      </div>

      {status !== 'taken' && (
        <div className="vaccine-card-action">
          <button className="vaccine-action-btn mark-done" onClick={onMarkDone}>
            Mark Done
          </button>
        </div>
      )}
    </div>
  );
}
