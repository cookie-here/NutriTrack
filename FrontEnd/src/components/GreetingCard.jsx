/**
 * GREETING CARD COMPONENT
 * =======================
 * Displays a personalized greeting with user info
 * Shows current trimester/month and due date
 * Includes profile button
 */

import { useNavigate } from 'react-router-dom';

const TRIMESTER_SEGMENTS = [
  { label: 'Trimester 1', startWeek: 0, endWeek: 13 },
  { label: 'Trimester 2', startWeek: 13, endWeek: 28 },
  { label: 'Trimester 3', startWeek: 28, endWeek: 40 }
];

const BABY_AGE_SEGMENTS = [
  { label: '0-6m', maxMonths: 6 },
  { label: '6-12m', maxMonths: 12 },
  { label: '12-24m', maxMonths: 24 }
];

export default function GreetingCard({
  userName = "",
  trimester = "Trimester 2",
  dueDate = "",
  weeksPregnant = null,
  userType = 'pregnant',
  babyAgeLabel = 'Age unknown',
  babyAgeMonths = null,
  babyAgeWeeks = null,
  babyDob = null
}) {
  const navigate = useNavigate();

  const safeWeeks = typeof weeksPregnant === 'number' ? Math.max(0, Math.min(40, weeksPregnant)) : null;
  const progressPercent = safeWeeks !== null ? (safeWeeks / 40) * 100 : null;
  const activeTrimesterIndex = TRIMESTER_SEGMENTS.findIndex(seg => trimester === seg.label);

  const safeBabyMonths = typeof babyAgeMonths === 'number' ? Math.max(0, Math.min(24, babyAgeMonths)) : null;
  const babyProgressPercent = safeBabyMonths !== null ? (safeBabyMonths / 24) * 100 : null;
  const activeAgeIndex = BABY_AGE_SEGMENTS.findIndex(seg => safeBabyMonths !== null && safeBabyMonths <= seg.maxMonths);

  return (
    <div className="greeting-card">
      <div className="greeting-header">
        <div className="greeting-text">
          <h1>Hello, <br /> <strong>{userName || 'Guest'}</strong></h1>
        </div>
        <button className="profile-button" onClick={() => navigate('/profile')} title="Go to Profile">
          <span>👤</span>
        </button>
      </div>
      
      <div className="trimester-info">
        <div className="info-badge">
          <span className="badge-icon">❤️</span>
          <div className="badge-content">
            {userType === 'pregnant' ? (
              <>
                <p className="badge-label">{trimester}</p>
                <div className="trimester-progress">
                  {TRIMESTER_SEGMENTS.map((seg, idx) => (
                    <div
                      key={seg.label}
                      className={`trimester-segment ${idx <= activeTrimesterIndex ? 'active' : ''}`}
                      style={{
                        gridColumn: `${idx + 1} / span 1`
                      }}
                    >
                      <span className="segment-label">{seg.label}</span>
                    </div>
                  ))}
                  {progressPercent !== null && (
                    <div
                      className="progress-indicator"
                      style={{ left: `${progressPercent}%` }}
                    >
                      <span className="indicator-dot" />
                      <span className="indicator-label">{safeWeeks}w</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="badge-label">Baby Age</p>
                <div className="trimester-progress age-progress">
                  {BABY_AGE_SEGMENTS.map((seg, idx) => (
                    <div
                      key={seg.label}
                      className={`trimester-segment ${idx <= activeAgeIndex ? 'active' : ''}`}
                      style={{ gridColumn: `${idx + 1} / span 1` }}
                    >
                      <span className="segment-label">{seg.label}</span>
                    </div>
                  ))}
                  {babyProgressPercent !== null && (
                    <div
                      className="progress-indicator"
                      style={{ left: `${babyProgressPercent}%` }}
                    >
                      <span className="indicator-dot" />
                      <span className="indicator-label">{babyAgeLabel}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="due-date">
          {userType === 'pregnant' ? (
            <p>Due Date: <strong>{formatDate(dueDate)}</strong></p>
          ) : (
            <p>Baby DOB: <strong>{formatDate(babyDob || dueDate)}</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-CA', options);
}
