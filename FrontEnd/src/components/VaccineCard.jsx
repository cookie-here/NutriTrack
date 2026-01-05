/**
 * VACCINE CARD COMPONENT
 * ======================
 * Displays individual vaccine cards with status
 * Shows name, description, due date, and action buttons
 */

// Format date for display (expects YYYY-MM-DD format from backend)
function formatDateOnly(dateString) {
  if (!dateString) return '';
  
  // Parse YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (Number.isNaN(date.getTime())) return dateString;
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export default function VaccineCard({ 
  id = 1,
  name = "Vaccine Name",
  emoji = "💉",
  description = "Vaccine description",
  dueDate = "Dec 1, 2025",
  status = "upcoming", // taken, pending, upcoming, completed
  forPerson = "Mother", // Mother, Baby
  details = "", // Additional details
  isDueWithinWeek = false, // Highlight if due within 7 days
  onMarkDone = () => {}
}) {
  const formattedDate = formatDateOnly(dueDate);
  
  return (
    <div className={`vaccine-card ${isDueWithinWeek && status !== 'taken' && status !== 'completed' ? 'urgent' : ''}`}>
      <div className="vaccine-card-header">
        <div className="vaccine-card-icon">{emoji}</div>
        <div className="vaccine-card-title-section">
          <h3 className="vaccine-card-title">{name}</h3>
          <div className="vaccine-card-status-wrapper">
            <span className={`vaccine-card-status ${status}`}>
              {status === 'taken' && '✓ Taken'}
              {status === 'completed' && '✓ Completed'}
              {status === 'pending' && '⏱ Pending'}
              {status === 'upcoming' && '⏰ Upcoming'}
              {status === 'overdue' && '⚠ Overdue'}
            </span>
            {isDueWithinWeek && status !== 'taken' && status !== 'completed' && (
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
          <span className="vaccine-detail-value">{formattedDate}</span>
        </div>
      </div>

      {status !== 'taken' && status !== 'completed' && (
        <div className="vaccine-card-action">
          <button className="vaccine-action-btn mark-done" onClick={onMarkDone}>
            Mark Done
          </button>
        </div>
      )}
    </div>
  );
}
