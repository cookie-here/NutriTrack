/**
 * VACCINES HEADER COMPONENT
 * =========================
 * Reusable header for vaccines page
 * Displays title, subtitle with back button
 */

export default function VaccinesHeader({ onBack = () => {} }) {
  return (
    <div className="vaccines-header">
      <button className="vaccines-header-back" onClick={onBack}>
        ←
      </button>
      <div className="vaccines-header-content">
        <h1>Vaccine Tracker</h1>
        <p>Track vaccination schedule</p>
      </div>
    </div>
  );
}
