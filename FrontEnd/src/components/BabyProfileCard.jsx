import { useBabyContext } from '../context/BabyContext';

export default function BabyProfileCard({
  babyAgeLabel = 'Age unknown',
  babyDob = null
}) {
  const { babies, selectedBaby, setSelectedBaby } = useBabyContext();
  const babyName = selectedBaby?.name || 'Baby';

  return (
    <div className="baby-profile-card">
      <div className="baby-profile-header">
        <div className="baby-avatar">
          <span className="baby-emoji">👶</span>
        </div>
        <div className="baby-profile-info">
          <h2 className="baby-name">{babyName}</h2>
          <p className="baby-dob-line">🎂 {formatDate(babyDob)}</p>
          <p className="baby-age-text">{babyAgeLabel}</p>
        </div>
        {babies && babies.length > 1 && (
          <select
            className="baby-card-select"
            value={selectedBaby?.id || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value, 10);
              const next = babies.find(b => b.id === id);
              if (next) setSelectedBaby(next);
            }}
          >
            {babies.map(baby => (
              <option key={baby.id} value={baby.id}>{baby.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
