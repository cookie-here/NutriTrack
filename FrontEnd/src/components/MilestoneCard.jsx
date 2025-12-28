/**
 * MILESTONE CARD COMPONENT
 * =======================
 * Displays individual milestone achievements
 * Shows emoji, name, age, and completion status
 */

export default function MilestoneCard({ 
  id = 1,
  name = "Milestone Name",
  emoji = "😊",
  ageInMonths = 2,
  completed = false,
  onClick = () => {}
}) {
  return (
    <div className={`milestone-card ${completed ? 'completed' : ''}`} onClick={onClick}>
      <div className="milestone-emoji">{emoji}</div>
      <div className="milestone-content">
        <h4>{name}</h4>
        <p className="milestone-age">📅 {ageInMonths} months</p>
      </div>
      {completed && <span className="milestone-check">✓</span>}
    </div>
  );
}
