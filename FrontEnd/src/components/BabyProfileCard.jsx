/**
 * BABY PROFILE CARD COMPONENT
 * ============================
 * Displays baby's profile information including:
 * - Baby age with progress line graph
 * - Date of birth
 * - Age segments (0-6m, 6-12m, 12-24m)
 */

import { useBabyContext } from '../context/BabyContext';

const BABY_AGE_SEGMENTS = [
  { label: '0-6m', maxMonths: 6 },
  { label: '6-12m', maxMonths: 12 },
  { label: '12-24m', maxMonths: 24 }
];

export default function BabyProfileCard({
  babyAgeLabel = 'Age unknown',
  babyAgeMonths = null,
  babyDob = null
}) {
  const { selectedBaby } = useBabyContext();
  const babyName = selectedBaby?.name || 'Baby';

  const safeBabyMonths = typeof babyAgeMonths === 'number' ? Math.max(0, Math.min(24, babyAgeMonths)) : null;
  const babyProgressPercent = safeBabyMonths !== null ? (safeBabyMonths / 24) * 100 : null;
  const activeAgeIndex = BABY_AGE_SEGMENTS.findIndex(seg => safeBabyMonths !== null && safeBabyMonths <= seg.maxMonths);

  return (
    <div className="baby-profile-card">
      <div className="baby-profile-header">
        <div className="baby-avatar">
          <span className="baby-emoji">👶</span>
        </div>
        <div className="baby-profile-info">
          <h2 className="baby-name">{babyName}</h2>
          <p className="baby-age-text">{babyAgeLabel}</p>
        </div>
      </div>
      
      <div className="baby-age-section">
        <div className="age-info-badge">
          <span className="age-badge-icon">📊</span>
          <div className="age-badge-content">
            <p className="age-badge-label">Baby Age Progress</p>
            <div className="baby-age-progress">
              {BABY_AGE_SEGMENTS.map((seg, idx) => (
                <div
                  key={seg.label}
                  className={`age-segment ${idx <= activeAgeIndex ? 'active' : ''}`}
                  style={{ gridColumn: `${idx + 1} / span 1` }}
                >
                  <span className="age-segment-label">{seg.label}</span>
                </div>
              ))}
              {babyProgressPercent !== null && (
                <div
                  className="baby-progress-indicator"
                  style={{ left: `${babyProgressPercent}%` }}
                >
                  <span className="baby-indicator-dot" />
                  <span className="baby-indicator-label">{babyAgeLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="baby-dob-section">
          <span className="dob-icon">🎂</span>
          <div className="dob-content">
            <p className="dob-label">Date of Birth</p>
            <p className="dob-date">{formatDate(babyDob)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
