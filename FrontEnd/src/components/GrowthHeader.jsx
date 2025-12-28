/**
 * GROWTH HEADER COMPONENT
 * ========================
 * Reusable header for growth page
 * Displays title with back button and add button
 */

export default function GrowthHeader({ onBack = () => {}, onAddRecord = () => {} }) {
  return (
    <div className="growth-header">
      <button className="growth-header-back" onClick={onBack}>
        ←
      </button>
      <div className="growth-header-content">
        <h1>Growth Tracker</h1>
        <p>Track baby's development</p>
      </div>
      <button className="growth-header-add-btn" onClick={onAddRecord}>
        +
      </button>
    </div>
  );
}
